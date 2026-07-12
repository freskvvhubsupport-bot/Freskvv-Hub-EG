// Admin Users Page
import { useState, useEffect } from 'react';
import { collection, query, orderBy, onSnapshot, doc, updateDoc, increment } from 'firebase/firestore';
import { db } from '../../firebase/config';
import toast from 'react-hot-toast';
import { MoreVertical, ShieldAlert, ShieldBan, Wallet, MessageSquare, X } from 'lucide-react';

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState(null);
  
  // Wallet modal state
  const [walletAmount, setWalletAmount] = useState('');
  
  // Status modal state
  const [statusReason, setStatusReason] = useState('');
  
  useEffect(() => {
    const q = query(collection(db, 'users'), orderBy('createdAt', 'desc'));
    const unsub = onSnapshot(q, snap => {
      setUsers(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      setLoading(false);
    });
    return unsub;
  }, []);

  const markAsReviewed = async (userId) => {
    try {
      await updateDoc(doc(db, 'users', userId), { isNew: false });
      toast.success('تم مراجعة المستخدم بنجاح');
    } catch {
      toast.error('حدث خطأ');
    }
  };

  const handleWalletUpdate = async (type) => {
    if (!walletAmount || isNaN(walletAmount) || walletAmount <= 0) {
      toast.error('يرجى إدخال مبلغ صحيح');
      return;
    }
    const amount = type === 'deposit' ? parseFloat(walletAmount) : -parseFloat(walletAmount);
    
    // Check if sufficient balance for withdrawal
    if (type === 'withdraw' && (selectedUser.walletBalance || 0) + amount < 0) {
      toast.error('الرصيد لا يكفي للسحب');
      return;
    }

    try {
      await updateDoc(doc(db, 'users', selectedUser.id), {
        walletBalance: increment(amount)
      });
      toast.success(type === 'deposit' ? 'تم الإيداع بنجاح' : 'تم السحب بنجاح');
      setWalletAmount('');
      setSelectedUser(null);
    } catch {
      toast.error('حدث خطأ أثناء تعديل المحفظة');
    }
  };

  const handleStatusUpdate = async (newStatus) => {
    if (newStatus !== 'active' && !statusReason.trim()) {
      toast.error('يرجى كتابة سبب الإجراء');
      return;
    }
    try {
      await updateDoc(doc(db, 'users', selectedUser.id), {
        status: newStatus,
        statusReason: newStatus === 'active' ? '' : statusReason.trim()
      });
      toast.success('تم تغيير حالة المستخدم');
      setStatusReason('');
      setSelectedUser(null);
    } catch {
      toast.error('حدث خطأ أثناء تغيير الحالة');
    }
  };

  const openChat = () => {
    // We will implement admin chat route navigation here later
    toast.success('سيتم فتح المحادثة... (قيد التطوير)');
    setSelectedUser(null);
  };

  return (
    <div>
      <h1 className="admin-page-title">إدارة المستخدمين</h1>
      <div className="admin-card" style={{ padding: 0, overflow: 'hidden' }}>
        {loading ? (
          <div style={{ padding: 'var(--space-8)', textAlign: 'center' }}>جاري التحميل...</div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table className="admin-table">
              <thead>
                <tr>
                  <th>الاسم</th>
                  <th>البريد</th>
                  <th>واتساب</th>
                  <th>المحفظة</th>
                  <th>الحالة</th>
                  <th>إجراءات</th>
                </tr>
              </thead>
              <tbody>
                {users.map(u => (
                  <tr key={u.id}>
                    <td>
                      <div style={{ fontWeight: 600 }}>{u.fullName || 'غير مكتمل'}</div>
                      <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)' }}>{u.howFound}</div>
                    </td>
                    <td>{u.email}</td>
                    <td dir="ltr" style={{ textAlign: 'right' }}>{u.whatsapp || '-'}</td>
                    <td style={{ fontWeight: 700, color: 'var(--accent-blue-bright)' }}>{u.walletBalance ?? 0} ج.م</td>
                    <td>
                      {u.isNew && <span className="badge badge-new" style={{ marginLeft: 4 }}>جديد</span>}
                      {u.role === 'admin' && <span className="badge badge-verified" style={{ marginLeft: 4 }}>أدمن</span>}
                      {u.status === 'suspended' && <span className="badge badge-warning" style={{ marginLeft: 4 }}>موقوف</span>}
                      {u.status === 'banned' && <span className="badge badge-error" style={{ marginLeft: 4 }}>محظور</span>}
                      {(!u.status || u.status === 'active') && u.role !== 'admin' && <span className="badge badge-success">نشط</span>}
                    </td>
                    <td>
                      <button 
                        className="btn-ghost" 
                        style={{ padding: '6px' }}
                        onClick={() => setSelectedUser(u)}
                      >
                        <MoreVertical size={18} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* User Action Modal */}
      {selectedUser && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(4px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999
        }}>
          <div className="admin-card" style={{ width: '90%', maxWidth: '500px', padding: 'var(--space-6)', position: 'relative' }}>
            <button 
              style={{ position: 'absolute', top: 16, left: 16, background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}
              onClick={() => setSelectedUser(null)}
            >
              <X size={24} />
            </button>
            
            <h2 style={{ fontSize: 'var(--font-size-xl)', marginBottom: 'var(--space-2)' }}>إدارة: {selectedUser.fullName || selectedUser.email}</h2>
            <p style={{ color: 'var(--text-muted)', marginBottom: 'var(--space-6)', fontSize: 'var(--font-size-sm)' }}>
              الرصيد الحالي: {selectedUser.walletBalance || 0} ج.م | الحالة: {selectedUser.status || 'نشط'}
            </p>

            {selectedUser.isNew && (
              <button className="btn-ghost" style={{ width: '100%', marginBottom: 'var(--space-4)' }} onClick={() => markAsReviewed(selectedUser.id)}>
                ✓ تحديد كمستخدم مراجع (إزالة علامة جديد)
              </button>
            )}

            {/* Wallet Section */}
            <div style={{ background: 'rgba(255,255,255,0.03)', padding: 'var(--space-4)', borderRadius: 'var(--radius-lg)', marginBottom: 'var(--space-4)' }}>
              <h3 style={{ fontSize: 'var(--font-size-md)', marginBottom: 'var(--space-3)', display: 'flex', alignItems: 'center', gap: 8 }}>
                <Wallet size={18} color="var(--accent-blue)" /> المحفظة
              </h3>
              <input 
                type="number" 
                className="form-input" 
                placeholder="المبلغ (ج.م)" 
                value={walletAmount} 
                onChange={e => setWalletAmount(e.target.value)} 
                style={{ marginBottom: 'var(--space-3)' }}
              />
              <div style={{ display: 'flex', gap: 'var(--space-3)' }}>
                <button className="btn-primary" style={{ flex: 1, background: 'var(--accent-green)' }} onClick={() => handleWalletUpdate('deposit')}>
                  إيداع +
                </button>
                <button className="btn-primary" style={{ flex: 1, background: 'var(--accent-orange)' }} onClick={() => handleWalletUpdate('withdraw')}>
                  سحب -
                </button>
              </div>
            </div>

            {/* Status Section */}
            <div style={{ background: 'rgba(255,255,255,0.03)', padding: 'var(--space-4)', borderRadius: 'var(--radius-lg)', marginBottom: 'var(--space-4)' }}>
              <h3 style={{ fontSize: 'var(--font-size-md)', marginBottom: 'var(--space-3)', display: 'flex', alignItems: 'center', gap: 8 }}>
                <ShieldAlert size={18} color="var(--accent-orange)" /> حالة الحساب
              </h3>
              {(selectedUser.status === 'suspended' || selectedUser.status === 'banned') ? (
                <button className="btn-primary" style={{ width: '100%', background: 'var(--accent-green)' }} onClick={() => handleStatusUpdate('active')}>
                  إلغاء الحظر / الإيقاف
                </button>
              ) : (
                <>
                  <input 
                    type="text" 
                    className="form-input" 
                    placeholder="سبب الإيقاف / الحظر (مطلوب لظهوره للمستخدم)" 
                    value={statusReason} 
                    onChange={e => setStatusReason(e.target.value)} 
                    style={{ marginBottom: 'var(--space-3)' }}
                  />
                  <div style={{ display: 'flex', gap: 'var(--space-3)' }}>
                    <button className="btn-primary" style={{ flex: 1, background: 'var(--accent-orange)' }} onClick={() => handleStatusUpdate('suspended')}>
                      إيقاف مؤقت
                    </button>
                    <button className="btn-primary" style={{ flex: 1, background: 'var(--accent-red)' }} onClick={() => handleStatusUpdate('banned')}>
                      حظر دائم
                    </button>
                  </div>
                </>
              )}
            </div>

            {/* Chat Section */}
            <button className="btn-ghost" style={{ width: '100%', display: 'flex', justifyContent: 'center', gap: 8, color: 'var(--text-primary)', border: '1px solid var(--border-glass)' }} onClick={openChat}>
              <MessageSquare size={18} /> فتح دردشة مباشرة
            </button>

          </div>
        </div>
      )}
    </div>
  );
}
