// Freskvv Tec EG — Community / Reviews Page
import { useState, useEffect } from 'react';
import { collection, addDoc, onSnapshot, query, where, orderBy, serverTimestamp } from 'firebase/firestore';
import { db } from '../../firebase/config';
import { useAuth } from '../../contexts/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, Send, MessageSquare, Users, CheckCircle2, Clock, Quote } from 'lucide-react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';

function StarRating({ value, onChange, readonly = false, size = 24 }) {
  const [hovered, setHovered] = useState(0);
  return (
    <div style={{ display: 'flex', gap: 4 }}>
      {[1, 2, 3, 4, 5].map(star => (
        <button
          key={star}
          type="button"
          disabled={readonly}
          onMouseEnter={() => !readonly && setHovered(star)}
          onMouseLeave={() => !readonly && setHovered(0)}
          onClick={() => !readonly && onChange?.(star)}
          style={{ background: 'none', border: 'none', cursor: readonly ? 'default' : 'pointer', padding: 2, transition: 'transform 0.15s' }}
        >
          <Star
            size={size}
            fill={(hovered || value) >= star ? '#facc15' : 'none'}
            color={(hovered || value) >= star ? '#facc15' : 'rgba(255,255,255,0.2)'}
            style={{ transition: 'all 0.15s', transform: (hovered || value) >= star ? 'scale(1.15)' : 'scale(1)' }}
          />
        </button>
      ))}
    </div>
  );
}

const SERVICE_OPTIONS = [
  'سيرفرات الألعاب', 'تطوير المواقع', 'تطوير التطبيقات', 'متجر الألعاب',
  'أنظمة الإدارة', 'التسويق الإلكتروني', 'الدعم الفني', 'أخرى'
];

export default function Community() {
  const { currentUser, userProfile } = useAuth();
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({ rating: 5, title: '', body: '', service: SERVICE_OPTIONS[0], jobTitle: '' });

  // Load approved reviews only
  useEffect(() => {
    const q = query(
      collection(db, 'reviews'),
      where('status', '==', 'approved'),
      orderBy('createdAt', 'desc')
    );
    const unsub = onSnapshot(q, snap => {
      setReviews(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      setLoading(false);
    }, () => setLoading(false));
    return unsub;
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title.trim() || !form.body.trim()) { toast.error('يرجى ملء جميع الحقول'); return; }
    if (form.body.trim().length < 20) { toast.error('يرجى كتابة رأيك بشكل أكثر تفصيلاً (20 حرف على الأقل)'); return; }

    setSubmitting(true);
    try {
      await addDoc(collection(db, 'reviews'), {
        userId: currentUser.uid,
        authorName: userProfile?.fullName || currentUser.email?.split('@')[0] || 'مستخدم',
        authorEmail: currentUser.email,
        jobTitle: form.jobTitle.trim(),
        rating: form.rating,
        title: form.title.trim(),
        body: form.body.trim(),
        service: form.service,
        status: 'pending', // needs admin approval
        createdAt: serverTimestamp(),
      });
      toast.success('تم إرسال رأيك بنجاح! سيظهر بعد مراجعة الفريق ✨');
      setForm({ rating: 5, title: '', body: '', service: SERVICE_OPTIONS[0], jobTitle: '' });
      setShowForm(false);
    } catch (err) {
      console.error(err);
      toast.error('حدث خطأ، يرجى المحاولة مرة أخرى');
    } finally {
      setSubmitting(false);
    }
  };

  const stats = [
    { label: 'رأي معتمد', value: reviews.length, icon: MessageSquare, color: 'var(--accent-blue)' },
    { label: 'متوسط التقييم', value: reviews.length > 0 ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1) : '—', icon: Star, color: '#facc15' },
    { label: 'عميل راضٍ', value: reviews.filter(r => r.rating >= 4).length, icon: CheckCircle2, color: '#22c55e' },
  ];

  return (
    <div style={{ paddingTop: 100, paddingBottom: 80, minHeight: '100vh' }}>
      <div className="container">

        {/* Hero */}
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} style={{ textAlign: 'center', marginBottom: 60 }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(79,159,255,0.1)', border: '1px solid rgba(79,159,255,0.2)', borderRadius: 99, padding: '6px 18px', marginBottom: 20, fontSize: 13, color: 'var(--accent-blue-bright)' }}>
            <Users size={15} /> مجتمع Freskvv Tec
          </div>
          <h1 style={{ fontSize: '2.8rem', fontWeight: 900, marginBottom: 14, lineHeight: 1.2 }}>
            آراء <span style={{ background: 'var(--gradient-main)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>عملاؤنا</span> الحقيقية
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '1.05rem', maxWidth: 540, margin: '0 auto 32px' }}>
            تجارب حقيقية من عملائنا المميزين. نعتز بثقتهم ونسعى دائماً لتجاوز توقعاتهم.
          </p>

          {currentUser ? (
            <button className="btn-primary" onClick={() => setShowForm(v => !v)} style={{ padding: '12px 32px', fontSize: '1rem' }}>
              <Star size={18} /> {showForm ? 'إخفاء النموذج' : 'شاركنا رأيك'}
            </button>
          ) : (
            <Link to="/auth/login" className="btn-primary" style={{ padding: '12px 32px', fontSize: '1rem', display: 'inline-flex', alignItems: 'center', gap: 8 }}>
              <Send size={18} /> سجّل دخولك لمشاركة رأيك
            </Link>
          )}
        </motion.div>

        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20, marginBottom: 48, maxWidth: 600, margin: '0 auto 48px' }}>
          {stats.map((s, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
              style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border-glass)', borderRadius: 16, padding: '20px 16px', textAlign: 'center' }}>
              <s.icon size={22} color={s.color} style={{ margin: '0 auto 8px' }} />
              <div style={{ fontSize: '1.8rem', fontWeight: 800, color: s.color }}>{s.value}</div>
              <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>{s.label}</div>
            </motion.div>
          ))}
        </div>

        {/* Submit Form */}
        <AnimatePresence>
          {showForm && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              style={{ overflow: 'hidden', marginBottom: 48 }}
            >
              <div style={{ background: 'linear-gradient(135deg, rgba(79,159,255,0.06), rgba(139,92,246,0.06))', border: '1px solid rgba(79,159,255,0.2)', borderRadius: 24, padding: '36px 40px', maxWidth: 680, margin: '0 auto' }}>
                <h2 style={{ fontSize: '1.4rem', fontWeight: 800, marginBottom: 8, display: 'flex', alignItems: 'center', gap: 10 }}>
                  <Star size={22} color="#facc15" /> شاركنا تجربتك
                </h2>
                <p style={{ color: 'var(--text-muted)', fontSize: 13, marginBottom: 28 }}>
                  <Clock size={13} style={{ display: 'inline', marginLeft: 4 }} />
                  سيظهر رأيك بعد مراجعة الفريق (عادةً خلال 24 ساعة)
                </p>

                <form onSubmit={handleSubmit}>
                  {/* Rating */}
                  <div style={{ marginBottom: 24, textAlign: 'center' }}>
                    <div style={{ fontSize: 14, color: 'var(--text-secondary)', marginBottom: 12 }}>تقييمك العام</div>
                    <StarRating value={form.rating} onChange={v => setForm(p => ({ ...p, rating: v }))} size={36} />
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
                    <div className="form-group">
                      <label>الخدمة المستخدمة</label>
                      <select className="form-input" value={form.service} onChange={e => setForm(p => ({ ...p, service: e.target.value }))}>
                        {SERVICE_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
                      </select>
                    </div>
                    <div className="form-group">
                      <label>مسمّاك الوظيفي (اختياري)</label>
                      <input type="text" className="form-input" value={form.jobTitle} onChange={e => setForm(p => ({ ...p, jobTitle: e.target.value }))} placeholder="مثال: مدير شركة" />
                    </div>
                  </div>

                  <div className="form-group" style={{ marginBottom: 16 }}>
                    <label>عنوان رأيك</label>
                    <input type="text" className="form-input" value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} placeholder="مثال: خدمة استثنائية وسرعة في التنفيذ" required maxLength={80} />
                  </div>

                  <div className="form-group" style={{ marginBottom: 24 }}>
                    <label>تفاصيل تجربتك</label>
                    <textarea className="form-input" value={form.body} onChange={e => setForm(p => ({ ...p, body: e.target.value }))} placeholder="شاركنا تجربتك بالتفصيل، ما الذي أعجبك؟ وما الذي ميّز Freskvv Tec عن غيرها؟" rows={4} required minLength={20} style={{ resize: 'vertical' }} />
                    <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{form.body.length} حرف (20 على الأقل)</span>
                  </div>

                  <button type="submit" className="btn-primary" disabled={submitting} style={{ width: '100%', justifyContent: 'center', padding: '13px' }}>
                    {submitting ? 'جاري الإرسال...' : <><Send size={16} /> إرسال رأيي</>}
                  </button>
                </form>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Reviews Grid */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: 60, color: 'var(--text-muted)' }}>جاري تحميل الآراء...</div>
        ) : reviews.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 80, background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-glass)', borderRadius: 20 }}>
            <MessageSquare size={56} style={{ opacity: 0.15, margin: '0 auto 16px' }} />
            <h3 style={{ marginBottom: 8 }}>كن أول من يشارك رأيه!</h3>
            <p style={{ color: 'var(--text-secondary)' }}>لا توجد آراء معتمدة بعد. ساعدنا في بناء المجتمع.</p>
          </div>
        ) : (
          <div style={{ columns: 'auto 340px', columnGap: 24 }}>
            {reviews.map((review, i) => (
              <motion.div
                key={review.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.06 }}
                style={{
                  breakInside: 'avoid',
                  background: 'rgba(255,255,255,0.03)',
                  border: '1px solid var(--border-glass)',
                  borderRadius: 20,
                  padding: '28px 24px',
                  marginBottom: 24,
                  position: 'relative',
                  overflow: 'hidden',
                }}
              >
                {/* Decorative quote */}
                <Quote size={52} style={{ position: 'absolute', top: 12, left: 14, opacity: 0.05, color: 'var(--accent-blue)' }} />

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                  <StarRating value={review.rating} readonly size={16} />
                  <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                    {review.createdAt?.toDate?.()?.toLocaleDateString('ar-EG') || ''}
                  </span>
                </div>

                <div style={{ fontSize: 11, color: 'var(--accent-blue-bright)', marginBottom: 8, fontWeight: 600 }}>
                  {review.service}
                </div>

                <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: 10 }}>{review.title}</h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: 14, lineHeight: 1.7, marginBottom: 20 }}>{review.body}</p>

                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'var(--gradient-main)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 16, flexShrink: 0 }}>
                    {review.authorName?.[0]?.toUpperCase() || '؟'}
                  </div>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 14 }}>{review.authorName}</div>
                    {review.jobTitle && <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{review.jobTitle}</div>}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
