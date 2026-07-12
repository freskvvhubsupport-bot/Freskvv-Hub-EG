// Freskvv Tec EG — Admin Discount Codes Panel (v2)
import { useState, useEffect } from 'react';
import { collection, onSnapshot, addDoc, doc, updateDoc, deleteDoc, serverTimestamp, Timestamp } from 'firebase/firestore';
import { db } from '../../firebase/config';
import { Plus, Trash2, Copy, RefreshCw, Tag, Gamepad2, Percent, CheckCircle2, XCircle, Zap, ChevronDown } from 'lucide-react';
import toast from 'react-hot-toast';
import ConfirmModal from '../../components/UI/ConfirmModal';

// ─── Code Generator ───────────────────────────────────────────────
function generateCode(prefix = '') {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 8; i++) code += chars[Math.floor(Math.random() * chars.length)];
  return prefix ? `${prefix}-${code}` : code;
}

const CODE_TYPES = [
  { value: 'discount', label: 'خصم على الخدمات', icon: Percent, color: '#8b5cf6' },
  { value: 'game_recharge', label: 'شحن ألعاب مجاني', icon: Gamepad2, color: '#22d3ee' },
];

const EMPTY_FORM = {
  code: '',
  type: 'discount',
  discountValue: '',
  discountType: 'percent',
  maxUses: 1,
  expiresAt: '',
  description: '',
  active: true,
  gameCategory: '',
  rechargeAmount: '',
};

// Bulk gen config per type
const EMPTY_BULK = {
  type: 'discount',
  count: 5,
  discountValue: 10,
  discountType: 'percent',
  maxUses: 1,
  gameCategory: '',
  rechargeAmount: 50,
};

export default function AdminDiscountCodes() {
  const [codes, setCodes] = useState([]);
  const [games, setGames] = useState([]); // auto-synced from game_store
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [activeTab, setActiveTab] = useState('all');
  const [bulk, setBulk] = useState(EMPTY_BULK);
  const [confirmState, setConfirmState] = useState({ open: false, id: null });

  // Listen to codes
  useEffect(() => {
    const unsub = onSnapshot(collection(db, 'discount_codes'), snap => {
      const data = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      data.sort((a, b) => (b.createdAt?.toMillis?.() || 0) - (a.createdAt?.toMillis?.() || 0));
      setCodes(data);
      setLoading(false);
    });
    return unsub;
  }, []);

  // Auto-sync games from game_store
  useEffect(() => {
    const unsub = onSnapshot(collection(db, 'game_store'), snap => {
      const names = [...new Set(snap.docs.map(d => d.data().name).filter(Boolean))];
      setGames(names);
      // Set default game category when games load
      setBulk(prev => ({ ...prev, gameCategory: prev.gameCategory || names[0] || '' }));
      setForm(prev => ({ ...prev, gameCategory: prev.gameCategory || names[0] || '' }));
    });
    return unsub;
  }, []);

  const openNew = () => {
    setForm({ ...EMPTY_FORM, code: generateCode('DISC'), gameCategory: games[0] || '' });
    setShowForm(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!form.code) { toast.error('الكود لا يمكن أن يكون فارغاً'); return; }
    const data = {
      code: form.code.toUpperCase().trim(),
      type: form.type,
      discountValue: Number(form.discountValue) || 0,
      discountType: form.discountType,
      maxUses: Number(form.maxUses) || 1,
      usedCount: 0,
      expiresAt: form.expiresAt ? Timestamp.fromDate(new Date(form.expiresAt)) : null,
      description: form.description,
      active: form.active,
      gameCategory: form.gameCategory,
      rechargeAmount: Number(form.rechargeAmount) || 0,
      createdAt: serverTimestamp(),
    };
    try {
      await addDoc(collection(db, 'discount_codes'), data);
      toast.success('تم إضافة الكود بنجاح!');
      setShowForm(false);
    } catch { toast.error('حدث خطأ'); }
  };

  const toggleActive = async (code) => {
    await updateDoc(doc(db, 'discount_codes', code.id), { active: !code.active });
    toast.success(code.active ? 'تم تعطيل الكود' : 'تم تفعيل الكود');
  };

  const confirmDelete = (id) => setConfirmState({ open: true, id });

  const handleDelete = async () => {
    try {
      await deleteDoc(doc(db, 'discount_codes', confirmState.id));
      toast.success('تم الحذف');
    } catch { toast.error('حدث خطأ'); }
    setConfirmState({ open: false, id: null });
  };

  const copyCode = (code) => {
    navigator.clipboard.writeText(code);
    toast.success('تم نسخ الكود!');
  };

  // Bulk generate
  const handleBulkGenerate = async () => {
    const count = Math.min(Number(bulk.count) || 5, 100);
    const prefix = bulk.type === 'game_recharge' ? 'GAME' : 'DISC';
    const toastId = toast.loading(`جاري توليد ${count} أكواد...`);
    try {
      for (let i = 0; i < count; i++) {
        await addDoc(collection(db, 'discount_codes'), {
          code: generateCode(prefix),
          type: bulk.type,
          discountValue: bulk.type === 'discount' ? Number(bulk.discountValue) : 0,
          discountType: bulk.discountType,
          maxUses: Number(bulk.maxUses) || 1,
          usedCount: 0,
          expiresAt: null,
          description: bulk.type === 'discount'
            ? `خصم ${bulk.discountValue}${bulk.discountType === 'percent' ? '%' : ' ج.م'} - مولّد تلقائياً`
            : `شحن ${bulk.rechargeAmount} ج.م لـ${bulk.gameCategory} - مولّد تلقائياً`,
          active: true,
          gameCategory: bulk.gameCategory || '',
          rechargeAmount: bulk.type === 'game_recharge' ? Number(bulk.rechargeAmount) : 0,
          createdAt: serverTimestamp(),
        });
      }
      toast.success(`تم توليد ${count} كود بنجاح!`, { id: toastId });
    } catch {
      toast.error('حدث خطأ أثناء التوليد', { id: toastId });
    }
  };

  const filtered = activeTab === 'all' ? codes : codes.filter(c => c.type === activeTab);
  const getTypeInfo = (type) => CODE_TYPES.find(t => t.value === type) || CODE_TYPES[0];

  return (
    <div>
      {/* Confirm Modal */}
      <ConfirmModal
        isOpen={confirmState.open}
        onConfirm={handleDelete}
        onCancel={() => setConfirmState({ open: false, id: null })}
        title="حذف الكود"
        message="هل أنت متأكد من حذف هذا الكود؟ لا يمكن التراجع عن هذا الإجراء."
        confirmText="نعم، احذف"
        cancelText="إلغاء"
        danger
      />

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-6)' }}>
        <div>
          <h1 className="admin-page-title">أكواد الخصم والشحن</h1>
          <p className="admin-page-desc">أنشئ وأدر أكواد الخصم وشحن الألعاب المجاني</p>
        </div>
        <button className="btn-primary" onClick={openNew}><Plus size={18} /> كود جديد</button>
      </div>

      {/* Stats Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 16, marginBottom: 24 }}>
        {[
          { label: 'إجمالي الأكواد', value: codes.length, color: 'var(--accent-blue)' },
          { label: 'فعّالة', value: codes.filter(c => c.active).length, color: '#22c55e' },
          { label: 'خصم خدمات', value: codes.filter(c => c.type === 'discount').length, color: '#8b5cf6' },
          { label: 'شحن ألعاب', value: codes.filter(c => c.type === 'game_recharge').length, color: '#22d3ee' },
        ].map((stat, i) => (
          <div key={i} className="admin-card" style={{ padding: '14px 18px', textAlign: 'center' }}>
            <div style={{ fontSize: '2rem', fontWeight: 800, color: stat.color }}>{stat.value}</div>
            <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Bulk Generator */}
      <div className="admin-card" style={{ padding: 22, marginBottom: 24, background: 'linear-gradient(135deg, rgba(79,159,255,0.04), rgba(139,92,246,0.04))', border: '1px solid rgba(79,159,255,0.15)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
          <Zap size={20} color="var(--accent-blue)" />
          <strong style={{ fontSize: 15 }}>توليد أكواد بالجملة</strong>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 12, marginBottom: 16 }}>
          {/* Type */}
          <div className="form-group" style={{ margin: 0 }}>
            <label style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 6, display: 'block' }}>نوع الكود</label>
            <select className="form-input" style={{ margin: 0 }} value={bulk.type} onChange={e => setBulk(prev => ({ ...prev, type: e.target.value }))}>
              {CODE_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
            </select>
          </div>

          {/* Count */}
          <div className="form-group" style={{ margin: 0 }}>
            <label style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 6, display: 'block' }}>عدد الأكواد</label>
            <input type="number" className="form-input" style={{ margin: 0 }} value={bulk.count} onChange={e => setBulk(prev => ({ ...prev, count: e.target.value }))} min={1} max={100} />
          </div>

          {/* Max Uses */}
          <div className="form-group" style={{ margin: 0 }}>
            <label style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 6, display: 'block' }}>استخدام لكل كود</label>
            <input type="number" className="form-input" style={{ margin: 0 }} value={bulk.maxUses} onChange={e => setBulk(prev => ({ ...prev, maxUses: e.target.value }))} min={1} />
          </div>

          {/* Discount fields */}
          {bulk.type === 'discount' && (
            <>
              <div className="form-group" style={{ margin: 0 }}>
                <label style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 6, display: 'block' }}>نوع الخصم</label>
                <select className="form-input" style={{ margin: 0 }} value={bulk.discountType} onChange={e => setBulk(prev => ({ ...prev, discountType: e.target.value }))}>
                  <option value="percent">نسبة % </option>
                  <option value="fixed">مبلغ ثابت ج.م</option>
                </select>
              </div>
              <div className="form-group" style={{ margin: 0 }}>
                <label style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 6, display: 'block' }}>قيمة الخصم</label>
                <input type="number" className="form-input" style={{ margin: 0 }} value={bulk.discountValue} onChange={e => setBulk(prev => ({ ...prev, discountValue: e.target.value }))} min={1} />
              </div>
            </>
          )}

          {/* Game recharge fields */}
          {bulk.type === 'game_recharge' && (
            <>
              <div className="form-group" style={{ margin: 0 }}>
                <label style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 6, display: 'block' }}>اللعبة <span style={{ color: '#22d3ee', fontSize: 10 }}>● تزامن تلقائي</span></label>
                <select className="form-input" style={{ margin: 0 }} value={bulk.gameCategory} onChange={e => setBulk(prev => ({ ...prev, gameCategory: e.target.value }))}>
                  {games.length === 0 && <option value="">لا توجد ألعاب مضافة</option>}
                  {games.map(g => <option key={g} value={g}>{g}</option>)}
                </select>
              </div>
              <div className="form-group" style={{ margin: 0 }}>
                <label style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 6, display: 'block' }}>مبلغ الشحن (ج.م)</label>
                <input type="number" className="form-input" style={{ margin: 0 }} value={bulk.rechargeAmount} onChange={e => setBulk(prev => ({ ...prev, rechargeAmount: e.target.value }))} min={1} />
              </div>
            </>
          )}
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>
            {bulk.type === 'discount'
              ? <>أكواد تبدأ بـ <code style={{ color: '#8b5cf6' }}>DISC-</code></>
              : <>أكواد تبدأ بـ <code style={{ color: '#22d3ee' }}>GAME-</code></>
            }
            {' '}— سيتم توليد {bulk.count} كود
          </p>
          <button className="btn-primary" onClick={handleBulkGenerate} style={{ padding: '9px 22px', fontSize: 14 }}>
            <RefreshCw size={15} /> توليد {bulk.count} أكواد
          </button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
        {[
          { key: 'all', label: 'الكل' },
          { key: 'discount', label: 'خصم الخدمات' },
          { key: 'game_recharge', label: 'شحن الألعاب' },
        ].map(tab => (
          <button key={tab.key} onClick={() => setActiveTab(tab.key)}
            style={{ padding: '7px 18px', borderRadius: 20, border: activeTab === tab.key ? '1px solid var(--accent-blue)' : '1px solid var(--border-glass)', background: activeTab === tab.key ? 'rgba(79,159,255,0.12)' : 'transparent', color: activeTab === tab.key ? 'var(--accent-blue-bright)' : 'var(--text-secondary)', cursor: 'pointer', fontSize: 13, fontWeight: 600, fontFamily: 'var(--font-primary)', transition: 'all 0.2s' }}
          >
            {tab.label} ({tab.key === 'all' ? codes.length : codes.filter(c => c.type === tab.key).length})
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="admin-card">
        {loading ? (
          <div style={{ padding: 24 }}>جاري التحميل...</div>
        ) : filtered.length === 0 ? (
          <div style={{ padding: 48, textAlign: 'center', color: 'var(--text-muted)' }}>
            <Tag size={48} style={{ opacity: 0.2, margin: '0 auto 16px' }} />
            <p>لا توجد أكواد بعد. استخدم التوليد التلقائي أو أضف كوداً يدوياً.</p>
          </div>
        ) : (
          <table className="admin-table">
            <thead>
              <tr>
                <th>الكود</th>
                <th>النوع</th>
                <th>القيمة</th>
                <th>الاستخدامات</th>
                <th>الحالة</th>
                <th>إجراءات</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(code => {
                const typeInfo = getTypeInfo(code.type);
                const TypeIcon = typeInfo.icon;
                const isExpired = code.expiresAt && code.expiresAt.toDate() < new Date();
                return (
                  <tr key={code.id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <code style={{ background: 'rgba(79,159,255,0.1)', color: 'var(--accent-blue-bright)', padding: '4px 10px', borderRadius: 6, fontFamily: 'monospace', fontSize: 13, letterSpacing: 1 }}>
                          {code.code}
                        </code>
                        <button className="btn-icon" onClick={() => copyCode(code.code)} title="نسخ" style={{ width: 28, height: 28 }}>
                          <Copy size={13} />
                        </button>
                      </div>
                      {code.description && <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>{code.description}</div>}
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <TypeIcon size={14} color={typeInfo.color} />
                        <span style={{ fontSize: 12, color: typeInfo.color, fontWeight: 600 }}>{typeInfo.label}</span>
                      </div>
                      {code.gameCategory && <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>{code.gameCategory}</div>}
                    </td>
                    <td>
                      {code.type === 'discount' ? (
                        <span style={{ fontWeight: 700, color: '#8b5cf6' }}>
                          {code.discountValue}{code.discountType === 'percent' ? '%' : ' ج.م'}
                        </span>
                      ) : (
                        <span style={{ fontWeight: 700, color: '#22d3ee' }}>
                          {code.rechargeAmount} ج.م
                        </span>
                      )}
                    </td>
                    <td>
                      <span style={{ fontSize: 13 }}>
                        <strong>{code.usedCount || 0}</strong>
                        {code.maxUses > 0 && <span style={{ color: 'var(--text-muted)' }}> / {code.maxUses}</span>}
                      </span>
                      {isExpired && <div style={{ fontSize: 11, color: '#ef4444' }}>منتهي</div>}
                    </td>
                    <td>
                      <span style={{ background: code.active && !isExpired ? 'rgba(34,197,94,0.12)' : 'rgba(239,68,68,0.12)', color: code.active && !isExpired ? '#22c55e' : '#ef4444', padding: '3px 10px', borderRadius: 4, fontSize: 12, fontWeight: 600 }}>
                        {isExpired ? 'منتهي' : code.active ? 'فعّال' : 'معطل'}
                      </span>
                    </td>
                    <td style={{ display: 'flex', gap: 6 }}>
                      <button className="btn-icon" onClick={() => toggleActive(code)} title={code.active ? 'تعطيل' : 'تفعيل'}>
                        {code.active ? <XCircle size={14} /> : <CheckCircle2 size={14} />}
                      </button>
                      <button className="btn-icon" style={{ color: '#ef4444' }} onClick={() => confirmDelete(code.id)}>
                        <Trash2 size={14} />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* Add Code Modal */}
      {showForm && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', display: 'flex', alignItems: 'flex-start', justifyContent: 'center', zIndex: 9999, overflowY: 'auto', padding: '40px 20px' }}>
          <div style={{ background: 'var(--bg-secondary)', padding: 32, borderRadius: 20, width: '100%', maxWidth: 560, border: '1px solid var(--border-glass)' }}>
            <h3 style={{ marginBottom: 24, display: 'flex', alignItems: 'center', gap: 8 }}>
              <Tag size={20} color="var(--accent-blue)" /> إضافة كود جديد
            </h3>
            <form onSubmit={handleSave}>
              {/* Code + Generate */}
              <div className="form-group" style={{ marginBottom: 16 }}>
                <label>الكود</label>
                <div style={{ display: 'flex', gap: 8 }}>
                  <input type="text" className="form-input" value={form.code}
                    onChange={e => setForm({ ...form, code: e.target.value.toUpperCase() })}
                    placeholder="DISC-XXXXXXXX" required
                    style={{ fontFamily: 'monospace', letterSpacing: 2, fontSize: 15 }} />
                  <button type="button"
                    onClick={() => setForm({ ...form, code: generateCode(form.type === 'game_recharge' ? 'GAME' : 'DISC') })}
                    style={{ flexShrink: 0, padding: '0 14px', background: 'rgba(79,159,255,0.1)', border: '1px solid var(--accent-blue)', color: 'var(--accent-blue-bright)', borderRadius: 10, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, fontFamily: 'var(--font-primary)' }}>
                    <RefreshCw size={14} /> توليد
                  </button>
                </div>
              </div>

              {/* Type Selector Cards */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
                {CODE_TYPES.map(t => (
                  <button key={t.value} type="button"
                    onClick={() => setForm({ ...form, type: t.value, code: generateCode(t.value === 'game_recharge' ? 'GAME' : 'DISC') })}
                    style={{ padding: '12px', borderRadius: 12, border: form.type === t.value ? `2px solid ${t.color}` : '1px solid var(--border-glass)', background: form.type === t.value ? `${t.color}18` : 'rgba(255,255,255,0.02)', color: form.type === t.value ? t.color : 'var(--text-secondary)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8, fontWeight: 600, fontSize: 13, fontFamily: 'var(--font-primary)', transition: 'all 0.2s' }}>
                    <t.icon size={17} /> {t.label}
                  </button>
                ))}
              </div>

              {/* Discount fields */}
              {form.type === 'discount' && (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
                  <div className="form-group">
                    <label>نوع الخصم</label>
                    <select className="form-input" value={form.discountType} onChange={e => setForm({ ...form, discountType: e.target.value })}>
                      <option value="percent">نسبة مئوية (%)</option>
                      <option value="fixed">مبلغ ثابت (ج.م)</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label>قيمة الخصم</label>
                    <input type="number" className="form-input" value={form.discountValue} onChange={e => setForm({ ...form, discountValue: e.target.value })} min={1} required />
                  </div>
                </div>
              )}

              {/* Game recharge fields — auto-synced games */}
              {form.type === 'game_recharge' && (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
                  <div className="form-group">
                    <label>اللعبة <span style={{ fontSize: 11, color: '#22d3ee' }}>● تزامن تلقائي مع المتجر</span></label>
                    <select className="form-input" value={form.gameCategory} onChange={e => setForm({ ...form, gameCategory: e.target.value })}>
                      {games.length === 0 && <option value="">أضف ألعاباً في المتجر أولاً</option>}
                      {games.map(g => <option key={g} value={g}>{g}</option>)}
                    </select>
                  </div>
                  <div className="form-group">
                    <label>مبلغ الشحن (ج.م)</label>
                    <input type="number" className="form-input" value={form.rechargeAmount} onChange={e => setForm({ ...form, rechargeAmount: e.target.value })} min={1} required />
                  </div>
                </div>
              )}

              {/* Limits */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
                <div className="form-group">
                  <label>الحد الأقصى (0 = بلا حد)</label>
                  <input type="number" className="form-input" value={form.maxUses} onChange={e => setForm({ ...form, maxUses: e.target.value })} min={0} />
                </div>
                <div className="form-group">
                  <label>تاريخ الانتهاء</label>
                  <input type="datetime-local" className="form-input" value={form.expiresAt} onChange={e => setForm({ ...form, expiresAt: e.target.value })} />
                </div>
              </div>

              <div className="form-group" style={{ marginBottom: 16 }}>
                <label>وصف داخلي (اختياري)</label>
                <input type="text" className="form-input" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} placeholder="مثال: كود خاص بحملة رمضان" />
              </div>

              <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', marginBottom: 24, fontSize: 14 }}>
                <input type="checkbox" checked={form.active} onChange={e => setForm({ ...form, active: e.target.checked })} />
                تفعيل الكود فوراً
              </label>

              <div style={{ display: 'flex', gap: 12 }}>
                <button type="submit" className="btn-primary" style={{ flex: 1, justifyContent: 'center' }}>
                  <Tag size={16} /> حفظ الكود
                </button>
                <button type="button" onClick={() => setShowForm(false)}
                  style={{ flex: 1, background: 'rgba(255,255,255,0.04)', border: '1px solid var(--border-glass)', color: 'var(--text-primary)', padding: 10, borderRadius: 10, cursor: 'pointer', fontFamily: 'var(--font-primary)' }}>
                  إلغاء
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
