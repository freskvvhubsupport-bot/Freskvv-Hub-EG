// Freskvv Tec EG — Admin Game Store Panel (Upgraded)
import { useState, useEffect } from 'react';
import { collection, onSnapshot, addDoc, doc, updateDoc, deleteDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../firebase/config';
import { Plus, Pencil, Trash2, GamepadIcon, DownloadCloud, Sparkles, X, Image, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

const CATEGORIES = ['ببجي', 'فري فاير', 'موبايل ليجيندز', 'ماين كرافت', 'روبلوكس', 'Steam', 'فالورانت', 'كلاش أوف كلانس', 'أخرى'];

// ── Game Images via proxy (bypasses hotlink restrictions) ──
const proxy = (url) => `https://images.weserv.nl/?url=${encodeURIComponent(url)}&w=400&h=250&fit=cover&output=webp`;

const GAME_IMAGE_MAP = [
  { keys: ['pubg', 'ببجي', 'playerunknown'],        img: proxy('https://upload.wikimedia.org/wikipedia/en/0/0f/PUBG_Mobile_Cover.jpg') },
  { keys: ['free fire', 'فري فاير', 'freefire'],    img: proxy('https://upload.wikimedia.org/wikipedia/en/c/ce/Garena_Free_Fire_cover.jpg') },
  { keys: ['roblox', 'روبلوكس'],                    img: proxy('https://upload.wikimedia.org/wikipedia/commons/4/44/Roblox_Logo_Red.png') },
  { keys: ['valorant', 'فالورانت'],                 img: proxy('https://upload.wikimedia.org/wikipedia/en/f/fc/Valorant_cover.jpg') },
  { keys: ['league', 'ليج', 'lol'],                img: proxy('https://upload.wikimedia.org/wikipedia/en/1/13/League_of_Legends_cover.jpg') },
  { keys: ['minecraft', 'ماين كرافت', 'ماين'],     img: proxy('https://upload.wikimedia.org/wikipedia/en/5/51/Minecraft_cover.png') },
  { keys: ['clash of clans', 'كلاش اوف', 'كلاش'],  img: proxy('https://upload.wikimedia.org/wikipedia/en/2/2b/Clash_of_Clans_cover.jpg') },
  { keys: ['mobile legends', 'موبايل ليجيندز', 'ml'], img: proxy('https://upload.wikimedia.org/wikipedia/en/0/06/Mobile_Legends%2C_Bang_Bang.png') },
  { keys: ['genshin', 'جينشن'],                     img: proxy('https://upload.wikimedia.org/wikipedia/en/3/38/Genshin_Impact_logo.jpg') },
  { keys: ['fortnite', 'فورتنايت'],                img: proxy('https://upload.wikimedia.org/wikipedia/en/9/93/Fortnite_chapter_4.jpg') },
  { keys: ['call of duty', 'كول اوف', 'cod'],      img: proxy('https://upload.wikimedia.org/wikipedia/en/8/8b/CODM_keyart.jpg') },
  { keys: ['fifa', 'فيفا', 'fc 24', 'fc25'],       img: proxy('https://upload.wikimedia.org/wikipedia/en/a/a3/EA_Sports_FC_24.jpg') },
  { keys: ['brawl stars', 'براول'],                img: proxy('https://upload.wikimedia.org/wikipedia/en/6/6a/Brawl_Stars_Logo.png') },
  { keys: ['clash royale', 'كلاش رويال'],          img: proxy('https://upload.wikimedia.org/wikipedia/en/5/5b/Clash_Royale_Logo.png') },
];

const FALLBACK_IMG = 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=400&h=250&fit=crop';

// Auto-detect game image based on name
function guessGameImage(name) {
  const lower = (name || '').toLowerCase();
  for (const entry of GAME_IMAGE_MAP) {
    if (entry.keys.some(k => lower.includes(k))) return entry.img;
  }
  return FALLBACK_IMG;
}


const emptyForm = {
  name: '',
  category: 'ببجي',
  imageUrl: '',
  description: '',
  deliveryType: 'code',
  available: true,
  // Price tiers: array of { quantity, price }
  tiers: [{ quantity: '', label: '', price: '' }]
};

export default function AdminGameStorePanel() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [fetchingImage, setFetchingImage] = useState(false);

  useEffect(() => {
    const unsub = onSnapshot(collection(db, 'game_store'), snap => {
      setItems(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      setLoading(false);
    });
    return unsub;
  }, []);

  // Auto-detect image when name changes
  const handleNameChange = (e) => {
    const newName = e.target.value;
    const guessedImg = guessGameImage(newName);
    setForm(prev => ({
      ...prev,
      name: newName,
      imageUrl: prev.imageUrl || guessedImg
    }));
  };

  // Manually re-fetch image from name
  const handleAutoImage = () => {
    if (!form.name) { toast.error('اكتب اسم اللعبة أولاً'); return; }
    setFetchingImage(true);
    setTimeout(() => {
      const img = guessGameImage(form.name);
      setForm(prev => ({ ...prev, imageUrl: img }));
      setFetchingImage(false);
      toast.success('تم تحديث صورة اللعبة تلقائياً ✨');
    }, 800);
  };

  const openNew = () => {
    setEditing(null);
    setForm(emptyForm);
    setShowForm(true);
  };

  const openEdit = (item) => {
    setEditing(item);
    setForm({
      name: item.name,
      category: item.category,
      imageUrl: item.imageUrl || guessGameImage(item.name),
      description: item.description || '',
      deliveryType: item.deliveryType || 'code',
      available: item.available !== false,
      tiers: item.tiers?.length > 0
        ? item.tiers
        : [{ quantity: item.price || '', label: 'الكمية الافتراضية', price: item.price || '' }]
    });
    setShowForm(true);
  };

  // Tier handlers
  const addTier = () => setForm(prev => ({ ...prev, tiers: [...prev.tiers, { quantity: '', label: '', price: '' }] }));
  const removeTier = (i) => setForm(prev => ({ ...prev, tiers: prev.tiers.filter((_, idx) => idx !== i) }));
  const updateTier = (i, field, value) => {
    const newTiers = [...form.tiers];
    newTiers[i][field] = value;
    setForm(prev => ({ ...prev, tiers: newTiers }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (form.tiers.length === 0 || form.tiers.some(t => !t.price || !t.label)) {
      toast.error('يرجى ملء جميع الكميات والأسعار');
      return;
    }
    const finalImageUrl = form.imageUrl || guessGameImage(form.name);
    const data = {
      name: form.name,
      category: form.category,
      imageUrl: finalImageUrl,
      description: form.description,
      deliveryType: form.deliveryType,
      available: form.available,
      tiers: form.tiers.map(t => ({ quantity: t.quantity, label: t.label, price: Number(t.price) })),
    };
    try {
      if (editing) {
        await updateDoc(doc(db, 'game_store', editing.id), { ...data, updatedAt: serverTimestamp() });
        toast.success('تم التحديث');
      } else {
        await addDoc(collection(db, 'game_store'), { ...data, createdAt: serverTimestamp() });
        toast.success('تم الإضافة');
      }
      setShowForm(false);
    } catch { toast.error('حدث خطأ'); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('هل أنت متأكد من الحذف؟')) return;
    await deleteDoc(doc(db, 'game_store', id));
    toast.success('تم الحذف');
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-6)' }}>
        <div>
          <h1 className="admin-page-title">إدارة متجر الألعاب</h1>
          <p className="admin-page-desc">أضف وعدّل منتجات شحن الألعاب مع كميات وأسعار مختلفة</p>
        </div>
        <button className="btn-primary" onClick={openNew}><Plus size={18} /> منتج جديد</button>
      </div>

      <div className="admin-card">
        {loading ? <div style={{ padding: 24 }}>جاري التحميل...</div> : (
          items.length === 0 ? (
            <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-muted)' }}>
              <GamepadIcon size={48} style={{ opacity: 0.3, marginBottom: 16, margin: '0 auto' }} />
              <p style={{ marginBottom: 24 }}>لا توجد منتجات. اضغط "منتج جديد" للبدء.</p>
            </div>
          ) : (
            <table className="admin-table">
              <thead><tr><th>الصورة</th><th>اسم المنتج</th><th>الفئة</th><th>الكميات / الأسعار</th><th>الحالة</th><th>إجراءات</th></tr></thead>
              <tbody>
                {items.map(item => (
                  <tr key={item.id}>
                    <td>
                      <img
                        src={item.imageUrl || guessGameImage(item.name)}
                        alt={item.name}
                        style={{ width: 48, height: 48, objectFit: 'cover', borderRadius: 8, border: '1px solid var(--border-glass)' }}
                        onError={e => { e.target.src = 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=80&h=80&fit=crop'; }}
                      />
                    </td>
                    <td style={{ fontWeight: 600 }}>{item.name}</td>
                    <td>{item.category}</td>
                    <td>
                      {item.tiers?.length > 0 ? (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                          {item.tiers.map((t, i) => (
                            <span key={i} style={{ fontSize: 12, background: 'rgba(79,159,255,0.1)', padding: '2px 8px', borderRadius: 4, color: 'var(--accent-blue-bright)' }}>
                              {t.label}: <strong>{t.price} ج.م</strong>
                            </span>
                          ))}
                        </div>
                      ) : (
                        <span style={{ color: 'var(--text-muted)' }}>—</span>
                      )}
                    </td>
                    <td>
                      <span style={{ background: item.available !== false ? 'rgba(34,197,94,0.2)' : 'rgba(239,68,68,0.2)', color: item.available !== false ? '#22c55e' : '#ef4444', padding: '4px 10px', borderRadius: 4, fontSize: 12 }}>
                        {item.available !== false ? 'متاح' : 'غير متاح'}
                      </span>
                    </td>
                    <td style={{ display: 'flex', gap: 8 }}>
                      <button className="btn-icon" onClick={() => openEdit(item)}><Pencil size={16} /></button>
                      <button className="btn-icon" style={{ color: '#ef4444' }} onClick={() => handleDelete(item.id)}><Trash2 size={16} /></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )
        )}
      </div>

      {/* Form Modal */}
      {showForm && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', display: 'flex', alignItems: 'flex-start', justifyContent: 'center', zIndex: 9999, overflowY: 'auto', padding: '40px 20px' }}>
          <div style={{ background: 'var(--bg-secondary)', padding: 32, borderRadius: 16, width: '100%', maxWidth: 620, border: '1px solid var(--border-glass)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
              <h3>{editing ? 'تعديل المنتج' : 'إضافة منتج جديد'}</h3>
              <button onClick={() => setShowForm(false)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}><X size={20} /></button>
            </div>

            <form onSubmit={handleSave}>
              {/* Basic Info */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
                <div className="form-group">
                  <label>اسم المنتج</label>
                  <input type="text" className="form-input" value={form.name} onChange={handleNameChange} placeholder="مثال: 660 شدة ببجي" required />
                </div>
                <div className="form-group">
                  <label>الفئة</label>
                  <select className="form-input" value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}>
                    {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
              </div>

              {/* Image with Auto-Fetch */}
              <div className="form-group" style={{ marginBottom: 16 }}>
                <label style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span>صورة اللعبة (تلقائية)</span>
                  <button type="button" onClick={handleAutoImage} style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'rgba(79,159,255,0.1)', border: '1px solid var(--accent-blue)', color: 'var(--accent-blue-bright)', padding: '4px 12px', borderRadius: 20, cursor: 'pointer', fontSize: 12 }}>
                    {fetchingImage ? <Loader2 size={14} style={{ animation: 'spin 0.8s linear infinite' }} /> : <Sparkles size={14} />}
                    تحديث تلقائي بالذكاء الاصطناعي
                  </button>
                </label>
                <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                  <input type="text" className="form-input" value={form.imageUrl} onChange={e => setForm({ ...form, imageUrl: e.target.value })} placeholder="رابط الصورة (يتعبأ تلقائياً)" style={{ flex: 1 }} />
                  {form.imageUrl && (
                    <img src={form.imageUrl} alt="preview" style={{ width: 56, height: 56, objectFit: 'cover', borderRadius: 8, border: '1px solid var(--border-glass)', flexShrink: 0 }}
                      onError={e => { e.target.style.display = 'none'; }} />
                  )}
                </div>
                <p style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>⚡ الصورة تُكتشف تلقائياً من اسم اللعبة عند الكتابة</p>
              </div>

              {/* Description */}
              <div className="form-group" style={{ marginBottom: 16 }}>
                <label>وصف (اختياري)</label>
                <textarea className="form-input" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} rows={2} />
              </div>

              {/* Delivery Type */}
              <div className="form-group" style={{ marginBottom: 16 }}>
                <label>نوع التسليم</label>
                <select className="form-input" value={form.deliveryType} onChange={e => setForm({ ...form, deliveryType: e.target.value })}>
                  <option value="code">كود فوري (تلقائي)</option>
                  <option value="manual">يدوي (يرسله الأدمن)</option>
                </select>
              </div>

              {/* Price Tiers */}
              <div style={{ marginBottom: 20, padding: 16, background: 'rgba(255,255,255,0.02)', borderRadius: 12, border: '1px solid var(--border-glass)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                  <h4 style={{ fontSize: 14, fontWeight: 700 }}>💰 الكميات والأسعار</h4>
                  <button type="button" onClick={addTier} style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'rgba(79,159,255,0.1)', border: '1px solid var(--accent-blue)', color: 'var(--accent-blue-bright)', padding: '4px 12px', borderRadius: 20, cursor: 'pointer', fontSize: 12 }}>
                    <Plus size={14} /> إضافة كمية
                  </button>
                </div>
                {form.tiers.map((tier, i) => (
                  <div key={i} style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr auto', gap: 8, marginBottom: 8, alignItems: 'center' }}>
                    <input
                      type="text"
                      className="form-input"
                      value={tier.label}
                      onChange={e => updateTier(i, 'label', e.target.value)}
                      placeholder="مثال: 60 ألماسة"
                      required
                      style={{ fontSize: 13, padding: '8px 12px' }}
                    />
                    <input
                      type="number"
                      className="form-input"
                      value={tier.quantity}
                      onChange={e => updateTier(i, 'quantity', e.target.value)}
                      placeholder="الكمية"
                      style={{ fontSize: 13, padding: '8px 12px' }}
                    />
                    <input
                      type="number"
                      className="form-input"
                      value={tier.price}
                      onChange={e => updateTier(i, 'price', e.target.value)}
                      placeholder="السعر ج.م"
                      required
                      min={1}
                      style={{ fontSize: 13, padding: '8px 12px' }}
                    />
                    <button type="button" onClick={() => removeTier(i)} style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', color: '#ef4444', width: 32, height: 32, borderRadius: 8, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <X size={14} />
                    </button>
                  </div>
                ))}
                {form.tiers.length === 0 && (
                  <p style={{ color: 'var(--text-muted)', fontSize: 13, textAlign: 'center', padding: 12 }}>اضغط "إضافة كمية" لإضافة أسعار مختلفة</p>
                )}
              </div>

              {/* Available */}
              <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', marginBottom: 24 }}>
                <input type="checkbox" checked={form.available} onChange={e => setForm({ ...form, available: e.target.checked })} />
                المنتج متاح للشراء
              </label>

              <div style={{ display: 'flex', gap: 12 }}>
                <button type="submit" className="btn-primary" style={{ flex: 1, justifyContent: 'center' }}>حفظ</button>
                <button type="button" onClick={() => setShowForm(false)} style={{ flex: 1, background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border-glass)', color: 'var(--text-primary)', padding: 10, borderRadius: 8, cursor: 'pointer' }}>إلغاء</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
