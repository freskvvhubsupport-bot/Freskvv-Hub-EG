// Freskvv Tec EG — Custom Service Request Page
import { useState } from 'react';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../firebase/config';
import { useAuth } from '../../contexts/AuthContext';
import { Wrench, Send, Sparkles, CheckCircle2, Clock, ShieldCheck, ArrowRight, MessageSquare } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';

const PROJECT_TYPES = [
  { id: 'web', name: 'موقع إلكتروني / تطبيق ويب', icon: '🌐' },
  { id: 'mobile', name: 'تطبيق هواتف (Android / iOS)', icon: '📱' },
  { id: 'server', name: 'سيرفر ألعاب (FiveM / PUBG / Discord)', icon: '🎮' },
  { id: 'system', name: 'نظام إدارة وشحن (ERP / API)', icon: '⚙️' },
  { id: 'social', name: 'تسويق وإدارة تواصل اجتماعي', icon: 'Megaphone' },
  { id: 'other', name: 'مشروع تقني آخر', icon: '💡' }
];

const BUDGET_RANGES = [
  'أقل من 500 ج.م',
  '500 — 1,500 ج.م',
  '1,500 — 5,000 ج.م',
  '5,000 — 15,000 ج.م',
  'أكثر من 15,000 ج.م'
];

export default function CustomService() {
  const { currentUser, userProfile } = useAuth();
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const [form, setForm] = useState({
    name: userProfile?.fullName || '',
    email: currentUser?.email || '',
    phone: userProfile?.whatsapp || '',
    projectType: PROJECT_TYPES[0].name,
    budget: BUDGET_RANGES[1],
    title: '',
    details: '',
    deliveryTime: 'خلال أسبوع'
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title.trim() || !form.details.trim() || !form.phone.trim()) {
      toast.error('يرجى ملء جميع الحقول المطلوبة ورقم التواصل');
      return;
    }

    setSubmitting(true);
    try {
      await addDoc(collection(db, 'orders'), {
        userId: currentUser ? currentUser.uid : 'guest',
        serviceSlug: 'custom-service',
        serviceName: `مشروع مخصص: ${form.projectType}`,
        packageName: form.title.trim(),
        price: 0, // Custom quote
        notes: `التفاصيل: ${form.details.trim()} | الميزانية المتوقعة: ${form.budget} | الهاتف/واتساب: ${form.phone} | المدة: ${form.deliveryTime}`,
        contactInfo: {
          name: form.name,
          email: form.email,
          phone: form.phone
        },
        status: 'pending',
        isCustomQuote: true,
        createdAt: serverTimestamp()
      });

      setSubmitted(true);
      toast.success('تم إرسال طلب المشروع بنجاح! يتواصل معك مهندس متخصص خلال ساعات ✨');
    } catch (err) {
      console.error(err);
      toast.error('حدث خطأ أثناء إرسال الطلب، يرجى المحاولة لاحقاً');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{ paddingTop: 110, paddingBottom: 90, minHeight: '100vh' }}>
      <div className="container" style={{ maxWidth: 860 }}>
        
        {/* Navigation back */}
        <Link to="/" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, color: 'var(--text-secondary)', textDecoration: 'none', marginBottom: 24, fontSize: 14, background: 'rgba(255,255,255,0.03)', padding: '7px 16px', borderRadius: 99, border: '1px solid var(--border-glass)' }}>
          <ArrowRight size={16} /> العودة للرئيسية
        </Link>

        {submitted ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            style={{
              background: 'rgba(13,13,34,0.8)',
              border: '1px solid rgba(34,197,94,0.3)',
              borderRadius: 24,
              padding: '60px 40px',
              textAlign: 'center',
              backdropFilter: 'blur(20px)'
            }}
          >
            <div style={{ width: 80, height: 80, borderRadius: '50%', background: 'rgba(34,197,94,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px', color: '#22c55e' }}>
              <CheckCircle2 size={48} />
            </div>
            <h2 style={{ fontSize: '2rem', fontWeight: 900, marginBottom: 12 }}>تم استلام طلب عرض السعر!</h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '1.05rem', maxWidth: 500, margin: '0 auto 32px', lineHeight: 1.7 }}>
              شكراً لثقتك بـ <strong>Freskvv Tec EG</strong>. قام فريق مهندسينا باستلام طلبك وسيتم مراجعته والتواصل معك على رقم الواتساب <strong style={{ color: 'var(--accent-blue-bright)', direction: 'ltr', display: 'inline-block' }}>{form.phone}</strong> لتقديم أفضل عرض سعر.
            </p>
            <div style={{ display: 'flex', gap: 14, justifyContent: 'center', flexWrap: 'wrap' }}>
              <button className="btn-primary" onClick={() => setSubmitted(false)}>تقديم طلب آخر</button>
              <a href="https://wa.me/201221640301" target="_blank" rel="noopener noreferrer" className="btn-ghost" style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
                <MessageSquare size={18} /> تواصل فوري عبر الواتساب
              </a>
            </div>
          </motion.div>
        ) : (
          <div>
            {/* Page Header */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} style={{ textAlign: 'center', marginBottom: 40 }}>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(79,159,255,0.1)', border: '1px solid rgba(79,159,255,0.2)', borderRadius: 99, padding: '6px 18px', marginBottom: 16, fontSize: 13, color: 'var(--accent-blue-bright)' }}>
                <Sparkles size={16} /> طلب خدمة أو مشروع مخصص
              </div>
              <h1 style={{ fontSize: '2.5rem', fontWeight: 900, marginBottom: 12 }}>
                ابدأ مشروعك مع <span className="gradient-text">Freskvv Tec EG</span>
              </h1>
              <p style={{ color: 'var(--text-secondary)', fontSize: '1.05rem', maxWidth: 600, margin: '0 auto' }}>
                شاركنا تفاصيل فكرتك أو مشروعك، وسيصلك عرض سعر مخصص وخطة تنفيذ احترافية بأسرع وقت
              </p>
            </motion.div>

            {/* Form & Features Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 32 }}>
              
              {/* Main Form */}
              <motion.form
                onSubmit={handleSubmit}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                style={{
                  background: 'rgba(13,13,34,0.7)',
                  border: '1px solid var(--border-glass)',
                  borderRadius: 24,
                  padding: '36px 40px',
                  backdropFilter: 'blur(20px)'
                }}
              >
                {/* 1. Project Type Selector */}
                <div style={{ marginBottom: 28 }}>
                  <label style={{ display: 'block', fontWeight: 700, marginBottom: 12, fontSize: 15 }}>1. اختر نوع المشروع / الخدمة</label>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(230px, 1fr))', gap: 10 }}>
                    {PROJECT_TYPES.map(type => (
                      <button
                        key={type.id}
                        type="button"
                        onClick={() => setForm(p => ({ ...p, projectType: type.name }))}
                        style={{
                          padding: '12px 16px',
                          borderRadius: 14,
                          border: form.projectType === type.name ? '2px solid var(--accent-blue)' : '1px solid var(--border-glass)',
                          background: form.projectType === type.name ? 'rgba(79,159,255,0.15)' : 'rgba(255,255,255,0.02)',
                          color: 'var(--text-primary)',
                          cursor: 'pointer',
                          textAlign: 'right',
                          display: 'flex',
                          alignItems: 'center',
                          gap: 10,
                          fontSize: 13,
                          fontWeight: 600,
                          transition: 'all 0.2s'
                        }}
                      >
                        <span style={{ fontSize: 20 }}>{type.icon}</span>
                        <span>{type.name}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* 2. Budget Range */}
                <div style={{ marginBottom: 28 }}>
                  <label style={{ display: 'block', fontWeight: 700, marginBottom: 12, fontSize: 15 }}>2. الميزانية المتوقعة للمشروع</label>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                    {BUDGET_RANGES.map(b => (
                      <button
                        key={b}
                        type="button"
                        onClick={() => setForm(p => ({ ...p, budget: b }))}
                        style={{
                          padding: '8px 16px',
                          borderRadius: 99,
                          border: form.budget === b ? '1px solid var(--accent-blue)' : '1px solid var(--border-glass)',
                          background: form.budget === b ? 'rgba(79,159,255,0.2)' : 'rgba(255,255,255,0.02)',
                          color: form.budget === b ? 'var(--accent-blue-bright)' : 'var(--text-secondary)',
                          cursor: 'pointer',
                          fontSize: 13,
                          fontWeight: 700,
                          transition: 'all 0.2s'
                        }}
                      >
                        {b}
                      </button>
                    ))}
                  </div>
                </div>

                {/* 3. Project Details */}
                <div className="form-group" style={{ marginBottom: 20 }}>
                  <label className="form-label">عنوان المشروع / الفكرة الرئيسية *</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="مثال: إنشاء موقع متجر إلكتروني لبيع الساعات"
                    value={form.title}
                    onChange={e => setForm(p => ({ ...p, title: e.target.value }))}
                    required
                  />
                </div>

                <div className="form-group" style={{ marginBottom: 24 }}>
                  <label className="form-label">شرح تفاصيل وتطلعات المشروع *</label>
                  <textarea
                    className="form-input"
                    rows={5}
                    placeholder="اكتب كل الميزات المطلوبة، الصفحات الرئيسية، الألوان المفضلة، أو أي أمثلة لمواقع تعجبك..."
                    value={form.details}
                    onChange={e => setForm(p => ({ ...p, details: e.target.value }))}
                    required
                    style={{ resize: 'vertical' }}
                  />
                </div>

                {/* 4. Contact Information */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16, marginBottom: 28 }}>
                  <div className="form-group">
                    <label className="form-label">الاسم بالكامل</label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="اسمك الكويم"
                      value={form.name}
                      onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">رقم الهاتف / الواتساب للتواصل *</label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="0122XXXXXXX"
                      value={form.phone}
                      onChange={e => setForm(p => ({ ...p, phone: e.target.value }))}
                      required
                      dir="ltr"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="btn-primary"
                  disabled={submitting}
                  style={{ width: '100%', justifyContent: 'center', padding: '14px', fontSize: '1.05rem' }}
                >
                  {submitting ? (
                    <><div className="spinner" /> جاري إرسال الطلب...</>
                  ) : (
                    <><Send size={18} /> إرسال طلب عرض السعر</>
                  )}
                </button>
              </motion.form>

              {/* Trust Indicators */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 16 }}>
                {[
                  { icon: <Clock size={22} color="var(--accent-blue-bright)" />, title: 'رد سريع خلال 4 ساعات', desc: 'يقوم مهندسو الفحص بمراجعة طلبك فوراً وإرسال العرض التفصيلي.' },
                  { icon: <ShieldCheck size={22} color="#22c55e" />, title: 'ضمان الجودة والدقة', desc: 'تسليم في المواعيد المحددة مع ضمان الدعم وتعديل ملحقات الخدمة.' },
                  { icon: <Sparkles size={22} color="#f59e0b" />, title: 'أسعار مناسبة ومنافسة', desc: 'نقدم باقات مرنة تناسب الميزانيات الصغيرة والمشاريع الضخمة.' }
                ].map((item, i) => (
                  <div key={i} style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-glass)', borderRadius: 16, padding: '20px', display: 'flex', gap: 14, alignItems: 'flex-start' }}>
                    <div style={{ padding: 10, background: 'rgba(255,255,255,0.03)', borderRadius: 12, flexShrink: 0 }}>
                      {item.icon}
                    </div>
                    <div>
                      <h4 style={{ fontSize: 14, fontWeight: 700, marginBottom: 4 }}>{item.title}</h4>
                      <p style={{ fontSize: 12, color: 'var(--text-muted)', lineHeight: 1.6 }}>{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>

            </div>
          </div>
        )}

      </div>
    </div>
  );
}
