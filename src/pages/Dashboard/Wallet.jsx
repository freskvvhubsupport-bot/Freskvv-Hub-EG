// Freskvv Tec EG — Wallet Page
import { useState, useEffect } from 'react';
import { collection, query, where, orderBy, onSnapshot, addDoc, serverTimestamp, getDocs, doc, updateDoc, increment, getDoc } from 'firebase/firestore';
import { ArrowDownCircle, ArrowUpCircle, Clock, RefreshCw, Wallet as WalletIcon, UploadCloud, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { db } from '../../firebase/config';
import { useAuth } from '../../contexts/AuthContext';
import './Wallet.css';

const ORANGE_CASH_NUMBER = '01221640301';

export default function Wallet() {
  const { currentUser, userProfile } = useAuth();
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [depositAmount, setDepositAmount] = useState('');
  const [receiptFile, setReceiptFile] = useState(null);
  const [depositModalOpen, setDepositModalOpen] = useState(false);
  const [refundModalOpen, setRefundModalOpen] = useState(false);
  const [refundForm, setRefundForm] = useState({ amount: '', reason: '' });
  const [submitting, setSubmitting] = useState(false);
  
  // Promocodes
  const [promoModalOpen, setPromoModalOpen] = useState(false);
  const [promoCode, setPromoCode] = useState('');

  // Real-time transactions listener
  useEffect(() => {
    if (!currentUser) return;
    const q = query(
      collection(db, 'transactions'),
      where('uid', '==', currentUser.uid),
      orderBy('createdAt', 'desc')
    );
    const unsub = onSnapshot(q, snap => {
      setTransactions(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      setLoading(false);
    });
    return unsub;
  }, [currentUser]);

  const compressImage = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target.result;
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const MAX_WIDTH = 800;
          const MAX_HEIGHT = 800;
          let width = img.width;
          let height = img.height;

          if (width > height) {
            if (width > MAX_WIDTH) {
              height *= MAX_WIDTH / width;
              width = MAX_WIDTH;
            }
          } else {
            if (height > MAX_HEIGHT) {
              width *= MAX_HEIGHT / height;
              height = MAX_HEIGHT;
            }
          }
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, width, height);
          resolve(canvas.toDataURL('image/jpeg', 0.6)); // 60% quality JPEG
        };
        img.onerror = (err) => reject(err);
      };
      reader.onerror = (err) => reject(err);
    });
  };

  const handleDepositRequest = async () => {
    if (!depositAmount || parseFloat(depositAmount) < 5) {
      toast.error('الحد الأدنى للإيداع 5 جنيه');
      return;
    }
    if (!receiptFile) {
      toast.error('الرجاء إرفاق صورة إثبات التحويل (سكرين شوت)');
      return;
    }

    setSubmitting(true);
    try {
      // Compress and convert image to Base64
      const base64Image = await compressImage(receiptFile);

      // Add deposit request document
      await addDoc(collection(db, 'depositRequests'), {
        uid: currentUser.uid,
        userEmail: currentUser.email,
        userName: userProfile?.fullName || '',
        amount: parseFloat(depositAmount),
        receiptUrl: base64Image, // Save Base64 instead of Storage URL
        status: 'pending',
        createdAt: serverTimestamp(),
      });
      toast.success('تم إرسال طلب الإيداع بنجاح! سيتم مراجعته خلال ساعات ✅');
      setDepositModalOpen(false);
      setDepositAmount('');
      setReceiptFile(null);
    } catch (err) {
      console.error(err);
      toast.error('حدث خطأ أثناء إرسال الطلب، حاول مرة أخرى');
    } finally {
      setSubmitting(false);
    }
  };

  const handleRefundRequest = async () => {
    if (!refundForm.amount || parseFloat(refundForm.amount) < 5) {
      toast.error('يرجى إدخال مبلغ صحيح');
      return;
    }
    if (!refundForm.reason.trim()) {
      toast.error('يرجى كتابة سبب الاسترداد');
      return;
    }
    setSubmitting(true);
    try {
      await addDoc(collection(db, 'refundRequests'), {
        uid: currentUser.uid,
        userEmail: currentUser.email,
        userName: userProfile?.fullName || '',
        whatsapp: userProfile?.whatsapp || '',
        amount: parseFloat(refundForm.amount),
        reason: refundForm.reason,
        status: 'pending',
        createdAt: serverTimestamp(),
      });
      toast.success('تم إرسال طلب الاسترداد! سيتم الرد خلال 7 أيام 📩');
      setRefundModalOpen(false);
      setRefundForm({ amount: '', reason: '' });
    } catch {
      toast.error('حدث خطأ، حاول مرة أخرى');
    } finally {
      setSubmitting(false);
    }
  };

  const handlePromoSubmit = async () => {
    if (!promoCode.trim()) {
      toast.error('يرجى إدخال كود الخصم');
      return;
    }
    setSubmitting(true);
    try {
      // البحث عن الكود في Firebase
      const q = query(
        collection(db, 'discount_codes'),
        where('code', '==', promoCode.trim().toUpperCase()),
        where('active', '==', true)
      );
      const snap = await getDocs(q);

      if (snap.empty) {
        toast.error('الكود غير صحيح أو غير موجود');
        setSubmitting(false);
        return;
      }

      const codeDoc = snap.docs[0];
      const codeData = codeDoc.data();

      // التحقق من الانتهاء
      if (codeData.expiresAt) {
        const expDate = codeData.expiresAt.toDate ? codeData.expiresAt.toDate() : new Date(codeData.expiresAt);
        if (expDate < new Date()) {
          toast.error('انتهت صلاحية هذا الكود');
          setSubmitting(false);
          return;
        }
      }

      // التحقق من عدد الاستخدامات
      const usedCount = codeData.usedCount || 0;
      const maxUses = codeData.maxUses || 1;
      if (usedCount >= maxUses) {
        toast.error('تم استنفاد جميع استخدامات هذا الكود');
        setSubmitting(false);
        return;
      }

      // تحقق من أن المستخدم لم يستخدم الكود قبل
      const usedBy = codeData.usedBy || [];
      if (usedBy.includes(currentUser.uid)) {
        toast.error('لقد استخدمت هذا الكود من قبل');
        setSubmitting(false);
        return;
      }

      // حساب المبلغ المضاف
      let bonusAmount = 0;
      if (codeData.type === 'discount') {
        if (codeData.discountType === 'fixed') {
          bonusAmount = codeData.discountValue || 0;
        } else {
          // percent — خصم على رصيد المحفظة الحالي (حد أدنى 5)
          const currentBalance = userProfile?.walletBalance ?? 0;
          bonusAmount = Math.round((currentBalance * (codeData.discountValue || 0)) / 100);
          bonusAmount = Math.max(bonusAmount, 5);
        }
      } else if (codeData.type === 'game_recharge') {
        bonusAmount = codeData.rechargeAmount || 0;
      }

      if (bonusAmount <= 0) {
        toast.error('الكود غير صالح للاستخدام');
        setSubmitting(false);
        return;
      }

      // إضافة الرصيد للمستخدم
      const userRef = doc(db, 'users', currentUser.uid);
      await updateDoc(userRef, {
        walletBalance: increment(bonusAmount),
      });

      // تسجيل المعاملة
      await addDoc(collection(db, 'transactions'), {
        uid: currentUser.uid,
        amount: bonusAmount,
        type: 'deposit',
        description: `كود خصم: ${promoCode.trim().toUpperCase()}`,
        createdAt: serverTimestamp(),
      });

      // تحديث عداد الاستخدام في الكود
      await updateDoc(doc(db, 'discount_codes', codeDoc.id), {
        usedCount: increment(1),
        usedBy: [...usedBy, currentUser.uid],
      });

      toast.success(`🎉 تم تفعيل الكود بنجاح! إضافة ${bonusAmount} ج.م لمحفظتك`);
      setPromoModalOpen(false);
      setPromoCode('');
    } catch (err) {
      console.error('Promo error:', err);
      toast.error('حدث خطأ أثناء تفعيل الكود');
    } finally {
      setSubmitting(false);
    }
  };

  const formatDate = (ts) => {
    if (!ts) return '';
    const d = ts.toDate ? ts.toDate() : new Date(ts);
    return d.toLocaleDateString('ar-EG', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="wallet-page" style={{ paddingTop: 100 }}>
      <div className="container">
        <div style={{ marginBottom: 24 }}>
          <Link to="/dashboard" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, color: 'var(--text-secondary)', textDecoration: 'none', marginBottom: 16 }}>
            <ArrowRight size={18} /> العودة للوحة التحكم
          </Link>
          <h1 className="wallet-title">المحفظة</h1>
        </div>

        {/* Balance Card */}
        <div className="wallet-balance-card">
          <div className="wallet-balance-label">الرصيد الحالي</div>
          <div className="wallet-balance-amount">
            {userProfile?.walletBalance ?? 0}
            <span>ج.م</span>
          </div>
          <div className="wallet-actions">
            <button className="btn-primary" onClick={() => setDepositModalOpen(true)}>
              <ArrowDownCircle size={18} />
              إيداع رصيد
            </button>
            <button className="btn-ghost" onClick={() => setRefundModalOpen(true)}>
              <RefreshCw size={18} />
              طلب استرداد
            </button>
            <button className="btn-ghost" style={{ borderColor: 'var(--accent-blue)', color: 'var(--accent-blue-bright)' }} onClick={() => setPromoModalOpen(true)}>
              🎟️ كود خصم
            </button>
          </div>

          {/* Orange Cash info */}
          <div className="wallet-orange-info">
            <span style={{ fontSize: 24 }}>🟠</span>
            <div>
              <div style={{ fontSize: 'var(--font-size-sm)', fontWeight: 700 }}>الإيداع عبر أورنچ كاش</div>
              <div style={{ fontSize: 'var(--font-size-base)', color: 'var(--accent-blue-bright)', fontWeight: 800, direction: 'ltr' }}>
                {ORANGE_CASH_NUMBER}
              </div>
            </div>
          </div>
        </div>

        {/* Transactions */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--space-5)' }}>
          <h2 className="wallet-section-title">سجل المعاملات</h2>
          <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)' }}>{transactions.length} معاملة</span>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: 'var(--space-16)', color: 'var(--text-muted)' }}>
            جاري التحميل...
          </div>
        ) : transactions.length === 0 ? (
          <div className="wallet-empty">
            <WalletIcon size={48} style={{ color: 'var(--text-muted)', marginBottom: 'var(--space-4)' }} />
            <div style={{ fontWeight: 700, marginBottom: 8 }}>لا توجد معاملات بعد</div>
            <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-muted)' }}>أيداع أول رصيد لابدأ</div>
          </div>
        ) : (
          <div className="transactions-list">
            {transactions.map(tx => (
              <div key={tx.id} className="transaction-item">
                <div className={`transaction-icon ${tx.type === 'deposit' ? 'deposit' : tx.type === 'refund' ? 'refund' : 'spend'}`}>
                  {tx.type === 'deposit' ? <ArrowDownCircle size={20} /> : tx.type === 'refund' ? <RefreshCw size={20} /> : <ArrowUpCircle size={20} />}
                </div>
                <div className="transaction-info">
                  <div className="transaction-label">{tx.description || (tx.type === 'deposit' ? 'إيداع رصيد' : 'خصم')}</div>
                  <div className="transaction-date">{formatDate(tx.createdAt)}</div>
                </div>
                <div className={`transaction-amount ${tx.type === 'deposit' || tx.type === 'refund' ? 'positive' : 'negative'}`}>
                  {tx.type === 'deposit' || tx.type === 'refund' ? '+' : '-'}{tx.amount} ج.م
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Deposit Modal */}
      {depositModalOpen && (
        <div className="modal-overlay" onClick={() => setDepositModalOpen(false)}>
          <div className="modal-card" onClick={e => e.stopPropagation()}>
            <h3 className="modal-title">إيداع رصيد عبر أورنچ كاش</h3>

            <div className="modal-info-box">
              <div style={{ fontSize: 'var(--font-size-sm)', lineHeight: 2 }}>
                1️⃣ حوّل المبلغ على رقم أورنچ كاش:<br />
                <strong style={{ color: 'var(--accent-blue-bright)', direction: 'ltr', display: 'block', textAlign: 'center', fontSize: 'var(--font-size-lg)' }}>
                  {ORANGE_CASH_NUMBER}
                </strong>
                2️⃣ أدخل المبلغ الذي حوّلته أدناه<br />
                3️⃣ سيتم مراجعة التحويل وإضافة الرصيد خلال ساعات
              </div>
            </div>

            <div className="form-group" style={{ marginBottom: 'var(--space-3)' }}>
              <label className="form-label">المبلغ (بالجنيه)</label>
              <input
                id="deposit-amount"
                className="form-input"
                type="number"
                placeholder="أدخل المبلغ الذي قمت بتحويله"
                min="5"
                value={depositAmount}
                onChange={e => setDepositAmount(e.target.value)}
                dir="ltr"
              />
            </div>

            <div className="form-group" style={{ marginBottom: 'var(--space-5)' }}>
              <label className="form-label">صورة إثبات التحويل (سكرين شوت)</label>
              <label className="form-input" style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', background: 'rgba(255,255,255,0.02)' }}>
                <UploadCloud size={18} style={{ color: 'var(--accent-blue-bright)' }} />
                <span style={{ color: receiptFile ? 'var(--text-primary)' : 'var(--text-muted)', flex: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {receiptFile ? receiptFile.name : 'اضغط لاختيار صورة المعاملة'}
                </span>
                <input 
                  type="file" 
                  accept="image/*" 
                  style={{ display: 'none' }} 
                  onChange={e => setReceiptFile(e.target.files[0])} 
                />
              </label>
            </div>

            <div style={{ display: 'flex', gap: 'var(--space-3)' }}>
              <button className="btn-ghost" onClick={() => setDepositModalOpen(false)} style={{ flex: 1 }}>
                إلغاء
              </button>
              <button className="btn-primary" onClick={handleDepositRequest} disabled={submitting} style={{ flex: 2 }}>
                {submitting ? <><div className="spinner" /> جاري الإرسال...</> : 'تأكيد الإيداع ✅'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Refund Modal */}
      {refundModalOpen && (
        <div className="modal-overlay" onClick={() => setRefundModalOpen(false)}>
          <div className="modal-card" onClick={e => e.stopPropagation()}>
            <h3 className="modal-title">طلب استرداد الأموال</h3>

            <div className="modal-info-box" style={{ background: 'rgba(248,113,113,0.06)', borderColor: 'rgba(248,113,113,0.2)' }}>
              <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-secondary)', lineHeight: 1.8 }}>
                ⚠️ سيتم الرد على طلب الاسترداد خلال <strong>7 أيام</strong> من تاريخ الطلب<br />
                يتم التواصل معك على رقم الواتساب المسجل
              </div>
            </div>

            <div className="auth-form" style={{ marginBottom: 'var(--space-5)' }}>
              <div className="form-group">
                <label className="form-label">المبلغ المراد استرداده (بالجنيه)</label>
                <input
                  className="form-input"
                  type="number"
                  placeholder="أدخل المبلغ"
                  min="5"
                  value={refundForm.amount}
                  onChange={e => setRefundForm(f => ({ ...f, amount: e.target.value }))}
                  dir="ltr"
                />
              </div>
              <div className="form-group">
                <label className="form-label">سبب الاسترداد</label>
                <textarea
                  className="form-input"
                  rows={3}
                  placeholder="اكتب سبب طلب الاسترداد..."
                  value={refundForm.reason}
                  onChange={e => setRefundForm(f => ({ ...f, reason: e.target.value }))}
                  style={{ resize: 'vertical' }}
                />
              </div>
            </div>

            <div style={{ display: 'flex', gap: 'var(--space-3)' }}>
              <button className="btn-ghost" onClick={() => setRefundModalOpen(false)} style={{ flex: 1 }}>
                إلغاء
              </button>
              <button className="btn-primary" onClick={handleRefundRequest} disabled={submitting} style={{ flex: 2 }}>
                {submitting ? <><div className="spinner" /> جاري الإرسال...</> : 'إرسال الطلب'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Promo Code Modal */}
      {promoModalOpen && (
        <div className="modal-overlay" onClick={() => setPromoModalOpen(false)}>
          <div className="modal-card" onClick={e => e.stopPropagation()}>
            <h3 className="modal-title">تفعيل كود الخصم 🎟️</h3>

            <div className="auth-form" style={{ marginBottom: 'var(--space-5)' }}>
              <div className="form-group">
                <label className="form-label">أدخل الكود هنا</label>
                <input
                  className="form-input"
                  type="text"
                  placeholder="مثال: WELCOME50"
                  value={promoCode}
                  onChange={e => setPromoCode(e.target.value.toUpperCase())}
                  dir="ltr"
                  style={{ textAlign: 'center', letterSpacing: '2px', fontSize: '1.2rem', fontWeight: 800 }}
                />
              </div>
            </div>

            <div style={{ display: 'flex', gap: 'var(--space-3)' }}>
              <button className="btn-ghost" onClick={() => setPromoModalOpen(false)} style={{ flex: 1 }}>
                إلغاء
              </button>
              <button className="btn-primary" onClick={handlePromoSubmit} disabled={submitting} style={{ flex: 2 }}>
                {submitting ? <><div className="spinner" /> جاري التفعيل...</> : 'تفعيل الكود'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
