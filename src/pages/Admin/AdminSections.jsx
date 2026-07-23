// Freskvv Tec EG — Admin Sections Manager
import { useState, useEffect } from 'react';
import { collection, onSnapshot, addDoc, doc, updateDoc, deleteDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../firebase/config';
import { Plus, Pencil, Trash2, Eye, EyeOff, DownloadCloud, Star, CheckCircle2, MessageSquare } from 'lucide-react';
import toast from 'react-hot-toast';
import { SERVICES } from '../../data/servicesData';

export default function AdminSections() {
  const [sections, setSections] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ name: '', slug: '', description: '', icon: '🚀', visible: true, order: 0, packages: [] });

  const guessIconAndSlug = (name) => {
    let icon = 'Layers';
    let slug = name.replace(/\s+/g, '-').toLowerCase();

    if (/سيرفر|استضافة|server|host/i.test(name)) { icon = 'Server'; slug = slug || 'servers'; }
    else if (/تطبيق|موبايل|هاتف|app|mobile/i.test(name)) { icon = 'Smartphone'; slug = slug || 'apps'; }
    else if (/موقع|ويب|انترنت|web|site/i.test(name)) { icon = 'Globe'; slug = slug || 'websites'; }
    else if (/نظام|ادارة|برنامج|system|erp|manage/i.test(name)) { icon = 'Settings'; slug = slug || 'systems'; }
    else if (/متابع|فولو|تيك|سوشيال|social|follow/i.test(name)) { icon = 'TrendingUp'; slug = slug || 'followers'; }
    else if (/مشروع|بروجكت|project/i.test(name)) { icon = 'FolderKanban'; slug = slug || 'projects'; }
    else if (/تسويق|اعلان|marketing|ads/i.test(name)) { icon = 'Megaphone'; slug = slug || 'marketing'; }
    else if (/دعم|شات|تواصل|support|chat/i.test(name)) { icon = 'MessageCircle'; slug = slug || 'support'; }
    else if (/أمن|حماية|سيبراني|security|cyber/i.test(name)) { icon = 'ShieldCheck'; slug = slug || 'security'; }
    else if (/تصميم|جرافيك|لوجو|design|graphic/i.test(name)) { icon = 'Palette'; slug = slug || 'design'; }
    else if (/ألعاب|شحن|game/i.test(name)) { icon = 'Gamepad2'; slug = slug || 'games'; }

    return { icon, slug };
  };

  // Listen to reviews
  useEffect(() => {
    const unsub = onSnapshot(collection(db, 'reviews'), snap => {
      setReviews(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });
    return unsub;
  }, []);

  const approveReview = async (reviewId) => {
    try {
      await updateDoc(doc(db, 'reviews', reviewId), { status: 'approved' });
      toast.success('تم قبول رأي العميل وسوف يظهر على الموقع الآن ✅');
    } catch {
      toast.error('حدث خطأ أثناء تفعيل رأي العميل');
    }
  };

  const deleteReview = async (reviewId) => {
    if (!window.confirm('هل أنت متأكد من حذف هذا التقييم؟')) return;
    try {
      await deleteDoc(doc(db, 'reviews', reviewId));
      toast.success('تم حذف التقييم');
    } catch {
      toast.error('حدث خطأ أثناء الحذف');
    }
  };

  const handleNameChange = (e) => {
    const newName = e.target.value;
    const { icon, slug } = guessIconAndSlug(newName);
    // Auto-update slug and icon only if we are typing a new section (not editing an existing old slug heavily)
    if (!editing) {
      setForm({ ...form, name: newName, icon, slug });
    } else {
      setForm({ ...form, name: newName });
    }
  };

  const handleAddPackage = () => {
    setForm({
      ...form,
      packages: [...form.packages, { id: Date.now().toString(), name: '', price: 0, color: '#3b82f6', features: [], popular: false }]
    });
  };

  const handleUpdatePackage = (index, field, value) => {
    const newPkgs = [...form.packages];
    newPkgs[index][field] = value;
    setForm({ ...form, packages: newPkgs });
  };

  const handleRemovePackage = (index) => {
    const newPkgs = form.packages.filter((_, i) => i !== index);
    setForm({ ...form, packages: newPkgs });
  };

  useEffect(() => {
    const unsub = onSnapshot(collection(db, 'sections'), snap => {
      setSections(snap.docs.map(d => ({ id: d.id, ...d.data() })).sort((a, b) => a.order - b.order));
      setLoading(false);
    });
    return unsub;
  }, []);

  const openNew = () => { setEditing(null); setForm({ name: '', slug: '', description: '', icon: 'Layers', visible: true, order: sections.length, packages: [] }); setShowForm(true); };
  const openEdit = (s) => { setEditing(s); setForm({ name: s.name, slug: s.slug || '', description: s.description || '', icon: s.icon || 'Layers', visible: s.visible !== false, order: s.order || 0, packages: s.packages || [] }); setShowForm(true); };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      if (editing) {
        await updateDoc(doc(db, 'sections', editing.id), { ...form, updatedAt: serverTimestamp() });
        toast.success('تم تحديث القسم');
      } else {
        await addDoc(collection(db, 'sections'), { ...form, createdAt: serverTimestamp() });
        toast.success('تم إضافة القسم');
      }
      setShowForm(false);
    } catch (err) { toast.error('حدث خطأ'); }
  };

  const toggleVisible = async (s) => {
    await updateDoc(doc(db, 'sections', s.id), { visible: !s.visible });
    toast.success(s.visible ? 'تم إخفاء القسم' : 'تم إظهار القسم');
  };

  const handleDelete = async (id) => {
    if (!window.confirm('هل أنت متأكد من حذف هذا القسم؟')) return;
    await deleteDoc(doc(db, 'sections', id));
    toast.success('تم الحذف');
  };

  const handleImportDefaults = async () => {
    if (!window.confirm('هل أنت متأكد من استيراد الأقسام الافتراضية؟ سيتم إضافتها إلى قاعدة البيانات.')) return;
    const toastId = toast.loading('جاري الاستيراد...');
    try {
      for (const s of SERVICES) {
        await addDoc(collection(db, 'sections'), {
          name: s.name,
          slug: s.slug,
          description: s.desc,
          icon: typeof s.icon === 'string' ? s.icon : '🚀',
          visible: true,
          order: s.id || 0,
          packages: s.packages.map((pkg, idx) => ({
            id: Date.now().toString() + idx,
            name: pkg.name,
            price: pkg.price,
            color: pkg.color,
            features: pkg.features,
            popular: pkg.popular || false
          })),
          createdAt: serverTimestamp()
        });
      }
      toast.success('تم استيراد الأقسام بنجاح!', { id: toastId });
    } catch (err) {
      console.error(err);
      toast.error('حدث خطأ أثناء الاستيراد', { id: toastId });
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-6)' }}>
        <div>
          <h1 className="admin-page-title">إدارة الأقسام</h1>
          <p className="admin-page-desc">تحكم في أقسام الموقع وإظهار/إخفائها</p>
        </div>
        <button className="btn-primary" onClick={openNew}><Plus size={18} /> قسم جديد</button>
      </div>

      <div className="admin-card">
        {loading ? <div style={{ padding: 24 }}>جاري التحميل...</div> : (
          sections.length === 0 ? (
            <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-muted)' }}>
              <p style={{ marginBottom: 24 }}>لا توجد أقسام. اضغط "قسم جديد" لإضافة أول قسم.</p>
              <button className="btn-ghost" style={{ margin: '0 auto', color: 'var(--accent-blue-bright)', border: '1px solid var(--accent-blue-bright)' }} onClick={handleImportDefaults}>
                <DownloadCloud size={18} /> استيراد الأقسام الأساسية الافتراضية للموقع
              </button>
            </div>
          ) : (
            <table className="admin-table">
              <thead><tr><th>الترتيب</th><th>اسم القسم</th><th>الوصف</th><th>الحالة</th><th>الإجراءات</th></tr></thead>
              <tbody>
                {sections.map(s => (
                  <tr key={s.id}>
                    <td style={{ width: 60, fontWeight: 'bold', color: 'var(--text-muted)' }}>#{s.order + 1}</td>
                    <td style={{ fontWeight: 600 }}>{s.name}</td>
                    <td style={{ color: 'var(--text-secondary)', maxWidth: 250 }}>{s.description || '—'}</td>
                    <td>
                      <span style={{ background: s.visible !== false ? 'rgba(34,197,94,0.2)' : 'rgba(239,68,68,0.2)', color: s.visible !== false ? '#22c55e' : '#ef4444', padding: '4px 10px', borderRadius: 4, fontSize: 12 }}>
                        {s.visible !== false ? 'ظاهر' : 'مخفي'}
                      </span>
                    </td>
                    <td style={{ display: 'flex', gap: 8 }}>
                      <button className="btn-icon" onClick={() => toggleVisible(s)} title="تبديل الظهور">{s.visible !== false ? <EyeOff size={16} /> : <Eye size={16} />}</button>
                      <button className="btn-icon" onClick={() => openEdit(s)} title="تعديل"><Pencil size={16} /></button>
                      <button className="btn-icon" style={{ color: '#ef4444' }} onClick={() => handleDelete(s.id)} title="حذف"><Trash2 size={16} /></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )
        )}
      </div>

      {/* Reviews Moderation Card */}
      <div className="admin-card" style={{ marginTop: 32 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <div>
            <h2 style={{ fontSize: 'var(--font-size-xl)', fontWeight: 800, display: 'flex', alignItems: 'center', gap: 10 }}>
              <MessageSquare size={22} color="var(--accent-blue)" /> إدارة ومراجعة آراء العملاء
            </h2>
            <p style={{ color: 'var(--text-muted)', fontSize: 13, marginTop: 4 }}>الموافقة على الآراء المكتوبة ليتم نشرها في صفحة المجتمع والرئيسية</p>
          </div>
          <span style={{ background: 'rgba(79,159,255,0.1)', color: 'var(--accent-blue-bright)', padding: '4px 12px', borderRadius: 99, fontSize: 12, fontWeight: 700 }}>
            {reviews.filter(r => r.status === 'pending').length} رأي قيد الانتظار
          </span>
        </div>

        {reviews.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 30, color: 'var(--text-muted)' }}>لا توجد تقييمات مكتوبة حتى الآن.</div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {reviews.map(rev => (
              <div key={rev.id} style={{ background: 'rgba(0,0,0,0.2)', border: rev.status === 'pending' ? '1px solid rgba(234,179,8,0.3)' : '1px solid var(--border-glass)', borderRadius: 14, padding: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
                    <span style={{ fontWeight: 800 }}>{rev.authorName || 'مستخدم'}</span>
                    <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{rev.service}</span>
                    <span style={{ fontSize: 12, color: '#facc15' }}>{'⭐'.repeat(rev.rating || 5)}</span>
                    {rev.status === 'pending' ? (
                      <span style={{ background: 'rgba(234,179,8,0.2)', color: '#eab308', padding: '2px 8px', borderRadius: 99, fontSize: 10, fontWeight: 700 }}>معلق ⏳</span>
                    ) : (
                      <span style={{ background: 'rgba(34,197,94,0.2)', color: '#22c55e', padding: '2px 8px', borderRadius: 99, fontSize: 10, fontWeight: 700 }}>معتمد ✅</span>
                    )}
                  </div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 2 }}>{rev.title}</div>
                  <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{rev.body}</div>
                </div>

                <div style={{ display: 'flex', gap: 8 }}>
                  {rev.status === 'pending' && (
                    <button className="btn-primary" style={{ padding: '6px 14px', fontSize: 12, background: '#22c55e' }} onClick={() => approveReview(rev.id)}>
                      موافقة ونشر
                    </button>
                  )}
                  <button className="btn-icon" style={{ color: '#ef4444', border: '1px solid rgba(239,68,68,0.2)', padding: '6px 12px', borderRadius: 8 }} onClick={() => deleteReview(rev.id)}>
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Form Modal */}
      {showForm && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'flex-start', justifyContent: 'center', zIndex: 9999, overflowY: 'auto', padding: '40px 20px' }}>
          <div style={{ background: 'var(--bg-secondary)', padding: 32, borderRadius: 16, width: '100%', maxWidth: 800, border: '1px solid var(--border-glass)' }}>
            <h3 style={{ marginBottom: 24 }}>{editing ? 'تعديل القسم' : 'إضافة قسم جديد'}</h3>
            <form onSubmit={handleSave}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <div className="form-group"><label>اسم القسم</label><input type="text" className="form-input" value={form.name} onChange={handleNameChange} placeholder="مثال: خدمات السيرفرات" required /></div>
                <div className="form-group"><label>رابط القسم (Slug)</label><input type="text" className="form-input" value={form.slug} onChange={e => setForm({...form, slug: e.target.value})} placeholder="مثال: servers" required /></div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <div className="form-group"><label>اسم الأيقونة تلقائي (Lucide Icon)</label><input type="text" className="form-input" value={form.icon} onChange={e => setForm({...form, icon: e.target.value})} placeholder="Server, Smartphone..." required /></div>
                <div className="form-group"><label>رقم الترتيب</label><input type="number" className="form-input" value={form.order} onChange={e => setForm({...form, order: Number(e.target.value)})} min={0} /></div>
              </div>
              <div className="form-group"><label>وصف القسم (اختياري)</label><textarea className="form-input" value={form.description} onChange={e => setForm({...form, description: e.target.value})} rows={2} /></div>
              
              <div style={{ margin: '24px 0', padding: 16, background: 'rgba(255,255,255,0.02)', borderRadius: 12, border: '1px solid var(--border-glass)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                  <h4>الباقات (Packages)</h4>
                  <button type="button" className="btn-ghost" onClick={handleAddPackage}><Plus size={16} /> إضافة باقة</button>
                </div>
                {form.packages.map((pkg, index) => (
                  <div key={pkg.id} style={{ background: 'rgba(0,0,0,0.2)', padding: 16, borderRadius: 8, marginBottom: 16, border: '1px solid rgba(255,255,255,0.05)' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12, marginBottom: 12 }}>
                      <div><label style={{ fontSize: 12, color: 'var(--text-muted)' }}>اسم الباقة</label><input type="text" className="form-input" value={pkg.name} onChange={e => handleUpdatePackage(index, 'name', e.target.value)} required /></div>
                      <div><label style={{ fontSize: 12, color: 'var(--text-muted)' }}>السعر</label><input type="number" className="form-input" value={pkg.price} onChange={e => handleUpdatePackage(index, 'price', Number(e.target.value))} required /></div>
                      <div><label style={{ fontSize: 12, color: 'var(--text-muted)' }}>لون الباقة</label><input type="color" className="form-input" style={{ padding: 4, height: 42 }} value={pkg.color} onChange={e => handleUpdatePackage(index, 'color', e.target.value)} /></div>
                    </div>
                    <div style={{ marginBottom: 12 }}>
                      <label style={{ fontSize: 12, color: 'var(--text-muted)' }}>المميزات (مفصولة بفاصلة ,)</label>
                      <input type="text" className="form-input" value={(pkg.features || []).join(', ')} onChange={e => handleUpdatePackage(index, 'features', e.target.value.split(',').map(s => s.trim()).filter(Boolean))} placeholder="ميزة 1, ميزة 2" />
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: 14 }}>
                        <input type="checkbox" checked={pkg.popular} onChange={e => handleUpdatePackage(index, 'popular', e.target.checked)} /> الأكثر طلباً
                      </label>
                      <button type="button" className="btn-icon" style={{ color: '#ef4444' }} onClick={() => handleRemovePackage(index)}><Trash2 size={16} /> حذف الباقة</button>
                    </div>
                  </div>
                ))}
              </div>

              <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', marginBottom: 24 }}>
                <input type="checkbox" checked={form.visible} onChange={e => setForm({...form, visible: e.target.checked})} />
                إظهار القسم على الموقع
              </label>
              <div style={{ display: 'flex', gap: 12 }}>
                <button type="submit" className="btn-primary" style={{ flex: 1, justifyContent: 'center' }}>حفظ التعديلات</button>
                <button type="button" onClick={() => setShowForm(false)} style={{ flex: 1, background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border-glass)', color: 'var(--text-primary)', padding: 10, borderRadius: 8, cursor: 'pointer' }}>إلغاء</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
