// Freskvv Tec EG — Admin Wallet Manager
import { useState, useEffect } from 'react';
import { collection, query, orderBy, onSnapshot, doc, updateDoc, increment, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../firebase/config';
import { CheckCircle2, XCircle, Clock, ExternalLink, RefreshCw } from 'lucide-react';
import toast from 'react-hot-toast';

export default function AdminWallet() {
  const [deposits, setDeposits] = useState([]);
  const [refunds, setRefunds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [previewImage, setPreviewImage] = useState(null);

  useEffect(() => {
    // Listen to Deposit Requests
    const q1 = query(collection(db, 'depositRequests'), orderBy('createdAt', 'desc'));
    const unsub1 = onSnapshot(q1, snap => {
      setDeposits(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });

    // Listen to Refund Requests
    const q2 = query(collection(db, 'refundRequests'), orderBy('createdAt', 'desc'));
    const unsub2 = onSnapshot(q2, snap => {
      setRefunds(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      setLoading(false);
    });

    return () => { unsub1(); unsub2(); };
  }, []);

  const handleApproveDeposit = async (req) => {
    if (!window.confirm(`هل أنت متأكد من إضافة ${req.amount} ج.م لمحفظة المستخدم ${req.userName}؟`)) return;
    
    try {
      // 1. Mark request as approved
      await updateDoc(doc(db, 'depositRequests', req.id), { status: 'approved' });

      // 2. Increment user wallet
      const userRef = doc(db, 'users', req.uid);
      await updateDoc(userRef, { walletBalance: increment(req.amount) });

      // 3. Create transaction log for user
      await addDoc(collection(db, 'transactions'), {
        uid: req.uid,
        amount: req.amount,
        type: 'deposit',
        description: 'إيداع رصيد (أورنچ كاش)',
        createdAt: serverTimestamp()
      });

      // 4. Create in-app notification
      await addDoc(collection(db, 'global_notifications'), {
        title: '✅ تم شحن رصيدك',
        message: `تم إضافة ${req.amount} ج.م لمحفظتك بنجاح. رصيدك جاهز للاستخدام!`,
        uid: req.uid, // Targeted notification
        createdAt: serverTimestamp()
      });

      toast.success('تم قبول الإيداع وإضافة الرصيد للعميل');
    } catch (error) {
      toast.error('حدث خطأ أثناء الموافقة على الإيداع');
    }
  };

  const handleRejectDeposit = async (req) => {
    if (!window.confirm('هل أنت متأكد من رفض هذا الإيداع؟')) return;
    
    try {
      await updateDoc(doc(db, 'depositRequests', req.id), { status: 'rejected' });
      await addDoc(collection(db, 'global_notifications'), {
        title: '❌ فشل عملية الإيداع',
        message: `تم رفض طلب إيداعك بقيمة ${req.amount} ج.م. يرجى التأكد من تحويل المبلغ بشكل صحيح والتواصل مع الدعم الفني.`,
        uid: req.uid,
        createdAt: serverTimestamp()
      });
      toast.success('تم رفض الإيداع');
    } catch {
      toast.error('حدث خطأ');
    }
  };

  const handleCompleteRefund = async (req) => {
    if (!window.confirm(`هل قمت بتحويل مبلغ ${req.amount} ج.م للمستخدم خارجياً وتود إغلاق الطلب؟`)) return;
    try {
      // Deduct from wallet
      const amountToDeduct = Number(req.amount);
      const userRef = doc(db, 'users', req.uid);
      await updateDoc(userRef, { walletBalance: increment(-Math.abs(amountToDeduct)) });

      // Update refund status
      await updateDoc(doc(db, 'refundRequests', req.id), { status: 'completed' });

      // Add transaction record
      await addDoc(collection(db, 'transactions'), {
        uid: req.uid,
        amount: req.amount,
        type: 'spend',
        description: 'سحب نقدي (استرداد رصيد)',
        createdAt: serverTimestamp()
      });

      // Notify user
      await addDoc(collection(db, 'global_notifications'), {
        title: '💸 اكتمل طلب الاسترداد',
        message: `تم تحويل مبلغ ${req.amount} ج.م إليك وخصمه من رصيد المحفظة.`,
        uid: req.uid,
        createdAt: serverTimestamp()
      });

      toast.success('تم إكمال طلب الاسترداد بنجاح');
    } catch {
      toast.error('حدث خطأ');
    }
  };

  return (
    <div>
      <div style={{ marginBottom: 'var(--space-6)' }}>
        <h1 className="admin-page-title">إدارة المحفظة والماليات</h1>
        <p className="admin-page-desc">مراجعة طلبات الإيداع (شحن الرصيد) وطلبات استرداد الأموال للعملاء</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: 'var(--space-6)' }}>
        
        {/* Deposit Requests */}
        <div className="admin-card">
          <h2 style={{ marginBottom: 24, borderBottom: '1px solid var(--border-glass)', paddingBottom: 16 }}>طلبات الإيداع (شحن الرصيد)</h2>
          {loading ? <div>جاري التحميل...</div> : deposits.length === 0 ? <div style={{ color: 'var(--text-muted)' }}>لا توجد طلبات إيداع</div> : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {deposits.map(req => (
                <div key={req.id} style={{ background: 'rgba(255,255,255,0.02)', padding: 16, borderRadius: 8, border: '1px solid var(--border-glass)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
                    <div>
                      <h4 style={{ margin: 0 }}>{req.userName || req.userEmail}</h4>
                      <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{req.createdAt?.toDate().toLocaleString('ar-EG')}</span>
                    </div>
                    <div style={{ fontSize: 20, fontWeight: 'bold', color: 'var(--accent-green-bright)' }}>{req.amount} ج.م</div>
                  </div>
                  
                  {req.receiptUrl && (
                    <button 
                      onClick={() => setPreviewImage(req.receiptUrl)} 
                      className="btn-ghost" 
                      style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 13, color: 'var(--accent-blue-bright)', marginBottom: 16, background: 'rgba(79,159,255,0.1)', padding: '6px 12px', borderRadius: 6, border: 'none' }}
                    >
                      <ExternalLink size={14} /> عرض صورة إثبات التحويل
                    </button>
                  )}

                  {req.status === 'pending' ? (
                    <div style={{ display: 'flex', gap: 8 }}>
                      <button onClick={() => handleApproveDeposit(req)} className="btn-primary" style={{ background: '#22c55e', flex: 1, justifyContent: 'center' }}>
                        <CheckCircle2 size={16} /> قبول وإضافة الرصيد
                      </button>
                      <button onClick={() => handleRejectDeposit(req)} className="btn-ghost" style={{ color: '#ef4444', borderColor: '#ef4444', flex: 1, justifyContent: 'center' }}>
                        <XCircle size={16} /> رفض
                      </button>
                    </div>
                  ) : (
                    <div style={{ display: 'inline-block', padding: '4px 10px', borderRadius: 4, fontSize: 12, background: req.status === 'approved' ? 'rgba(34,197,94,0.2)' : 'rgba(239,68,68,0.2)', color: req.status === 'approved' ? '#22c55e' : '#ef4444' }}>
                      {req.status === 'approved' ? 'تم القبول وإضافة الرصيد' : 'مرفوض'}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Refund Requests */}
        <div className="admin-card">
          <h2 style={{ marginBottom: 24, borderBottom: '1px solid var(--border-glass)', paddingBottom: 16 }}>طلبات سحب / استرداد الرصيد</h2>
          {loading ? <div>جاري التحميل...</div> : refunds.length === 0 ? <div style={{ color: 'var(--text-muted)' }}>لا توجد طلبات استرداد</div> : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {refunds.map(req => (
                <div key={req.id} style={{ background: 'rgba(255,255,255,0.02)', padding: 16, borderRadius: 8, border: '1px solid var(--border-glass)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
                    <div>
                      <h4 style={{ margin: 0 }}>{req.userName || req.userEmail}</h4>
                      <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>واتساب: {req.whatsapp || 'غير متوفر'}</span>
                    </div>
                    <div style={{ fontSize: 20, fontWeight: 'bold', color: '#ef4444' }}>{req.amount} ج.م</div>
                  </div>
                  
                  <div style={{ background: 'rgba(0,0,0,0.3)', padding: 12, borderRadius: 6, marginBottom: 16, fontSize: 14, color: 'var(--text-secondary)' }}>
                    <strong>سبب الاسترداد:</strong><br/>
                    {req.reason}
                  </div>

                  {req.status === 'pending' ? (
                    <button onClick={() => handleCompleteRefund(req)} className="btn-primary" style={{ width: '100%', justifyContent: 'center' }}>
                      <RefreshCw size={16} /> تحديد كمكتمل (بعد التحويل للعميل)
                    </button>
                  ) : (
                    <div style={{ display: 'inline-block', padding: '4px 10px', borderRadius: 4, fontSize: 12, background: 'rgba(34,197,94,0.2)', color: '#22c55e' }}>
                      تم تحويل المبلغ للعميل وإغلاق الطلب
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Image Preview Modal */}
      {previewImage && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.9)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: 20 }} onClick={() => setPreviewImage(null)}>
          <div style={{ position: 'relative', maxWidth: '90vw', maxHeight: '90vh' }}>
            <button 
              onClick={() => setPreviewImage(null)} 
              style={{ position: 'absolute', top: -40, right: 0, background: 'none', border: 'none', color: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8 }}
            >
              <XCircle size={24} /> إغلاق
            </button>
            <img 
              src={previewImage} 
              alt="إثبات التحويل" 
              style={{ maxWidth: '100%', maxHeight: '85vh', objectFit: 'contain', borderRadius: 8, boxShadow: '0 10px 40px rgba(0,0,0,0.5)' }} 
              onClick={(e) => e.stopPropagation()}
            />
          </div>
        </div>
      )}
    </div>
  );
}
