// Freskvv Tec EG — Service Detail & Checkout
import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { db } from '../../firebase/config';
import { doc, collection, addDoc, updateDoc, increment, serverTimestamp, getDoc, query, where, getDocs } from 'firebase/firestore';
import { motion } from 'framer-motion';
import { Check, ArrowRight, Wallet, AlertCircle, ShoppingCart } from 'lucide-react';
import toast from 'react-hot-toast';
import './Services.css'; // Reuse styles

export default function ServiceDetail() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  
  const [service, setService] = useState(null);
  const [selectedPkg, setSelectedPkg] = useState(null);
  const [formData, setFormData] = useState({ projectName: '', notes: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [userWallet, setUserWallet] = useState(0);

  const [loading, setLoading] = useState(true);

  // Read pkg query param if exists
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const initialPkgId = queryParams.get('pkg');

  useEffect(() => {
    const fetchService = async () => {
      try {
        const q = query(collection(db, 'sections'), where('slug', '==', slug));
        const querySnapshot = await getDocs(q);
        if (querySnapshot.empty) {
          navigate('/services', { replace: true });
        } else {
          const serviceData = querySnapshot.docs[0].data();
          setService(serviceData);
          if (initialPkgId && serviceData.packages) {
            const foundPkg = serviceData.packages.find(p => p.id === initialPkgId);
            if (foundPkg) setSelectedPkg(foundPkg);
          }
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchService();
  }, [slug, navigate, initialPkgId]);

  useEffect(() => {
    if (currentUser) {
      // Fetch latest wallet balance
      getDoc(doc(db, 'users', currentUser.uid)).then(d => {
        if (d.exists()) setUserWallet(d.data().walletBalance || 0);
      });
    }
  }, [currentUser]);

  if (loading) return <div style={{ paddingTop: 120, textAlign: 'center', color: 'var(--text-muted)' }}>جاري تحميل تفاصيل الخدمة...</div>;
  if (!service) return null;

  const handleOrder = async (e) => {
    e.preventDefault();
    if (!currentUser) {
      toast.error('يجب تسجيل الدخول أولاً لإتمام الطلب');
      navigate('/auth/login', { state: { returnTo: `/services/${slug}` } });
      return;
    }
    if (!selectedPkg) {
      toast.error('الرجاء اختيار باقة أولاً');
      return;
    }

    if (userWallet < selectedPkg.price) {
      toast.error('عذراً، رصيد المحفظة لا يكفي. يرجى الشحن أولاً.');
      return;
    }

    if (!formData.projectName.trim()) {
      toast.error('الرجاء إدخال اسم المشروع/الطلب');
      return;
    }

    setIsSubmitting(true);
    try {
      // 1. Deduct from wallet
      const userRef = doc(db, 'users', currentUser.uid);
      await updateDoc(userRef, {
        walletBalance: increment(-selectedPkg.price)
      });

      // 2. Create Order
      await addDoc(collection(db, 'orders'), {
        userId: currentUser.uid,
        serviceSlug: service.slug,
        serviceName: service.name,
        packageId: selectedPkg.id,
        packageName: selectedPkg.name,
        price: selectedPkg.price,
        projectName: formData.projectName,
        notes: formData.notes,
        status: 'pending', // pending, in-progress, completed, cancelled
        createdAt: serverTimestamp()
      });

      toast.success('تم استلام طلبك بنجاح! شكراً لك.');
      navigate('/dashboard');
    } catch (error) {
      console.error(error);
      toast.error('حدث خطأ أثناء معالجة الطلب');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="services-page" style={{ paddingTop: '120px' }}>
      <div className="container">
        <Link to="/services" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, color: 'var(--text-secondary)', marginBottom: 24, textDecoration: 'none' }}>
          <ArrowRight size={18} /> العودة للخدمات
        </Link>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 40 }}>
          <div style={{ color: 'var(--accent-blue-bright)' }}>{service.icon}</div>
          <div>
            <h1 style={{ fontSize: '2.5rem', margin: 0, fontWeight: 800 }}>{service.name}</h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem', marginTop: 8 }}>{service.desc}</p>
          </div>
        </div>

        <div className="packages-grid" style={{ marginBottom: 48 }}>
          {service.packages && service.packages.map(pkg => (
            <div 
              key={pkg.id} 
              className={`package-card ${selectedPkg?.id === pkg.id ? 'selected' : ''}`}
              style={{
                cursor: 'pointer',
                border: selectedPkg?.id === pkg.id ? `2px solid ${pkg.color}` : '1px solid var(--border-glass)',
                transform: selectedPkg?.id === pkg.id ? 'translateY(-8px)' : 'none',
                boxShadow: selectedPkg?.id === pkg.id ? `0 10px 30px ${pkg.color}33` : 'none'
              }}
              onClick={() => setSelectedPkg(pkg)}
            >
              {pkg.popular && <div className="popular-badge">⭐ الأكثر طلباً</div>}
              <div className="package-color-line" style={{ background: pkg.color }} />
              <div className="package-name">{pkg.name}</div>
              <div className="package-price">
                {pkg.price}<span>ج.م</span>
              </div>
              <div className="package-features">
                {pkg.features && pkg.features.map(f => (
                  <div key={f} className="package-feature">
                    <Check size={14} style={{ color: pkg.color, flexShrink: 0 }} />
                    <span>{f}</span>
                  </div>
                ))}
              </div>
              <div className="btn-primary" style={{ width: '100%', justifyContent: 'center', background: selectedPkg?.id === pkg.id ? `linear-gradient(135deg, ${pkg.color}, ${pkg.color}bb)` : 'rgba(255,255,255,0.05)', color: selectedPkg?.id === pkg.id ? '#fff' : 'var(--text-secondary)' }}>
                {selectedPkg?.id === pkg.id ? 'تم الاختيار' : 'اختر هذه الباقة'}
              </div>
            </div>
          ))}
        </div>

        {selectedPkg && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            style={{ background: 'rgba(10,10,26,0.6)', padding: 32, borderRadius: 24, border: '1px solid var(--border-glass)' }}
          >
            <h2 style={{ marginBottom: 24, display: 'flex', alignItems: 'center', gap: 12 }}>
              <ShoppingCart size={24} color="var(--accent-blue)" /> إتمام الطلب
            </h2>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 32 }}>
              {/* Order Form */}
              <form onSubmit={handleOrder}>
                <div className="form-group">
                  <label>اسم المشروع / الدومين / السيرفر</label>
                  <input 
                    type="text" 
                    className="form-input"
                    value={formData.projectName}
                    onChange={e => setFormData({...formData, projectName: e.target.value})}
                    placeholder="مثال: موقع شركة العالمية"
                    required
                  />
                </div>
                <div className="form-group">
                  <label>ملاحظات إضافية (اختياري)</label>
                  <textarea 
                    className="form-input"
                    value={formData.notes}
                    onChange={e => setFormData({...formData, notes: e.target.value})}
                    placeholder="أي تفاصيل أخرى تريد إضافتها..."
                    rows={4}
                  />
                </div>

                <button type="submit" className="btn-primary" disabled={isSubmitting} style={{ width: '100%', justifyContent: 'center', marginTop: 16 }}>
                  {isSubmitting ? 'جاري المعالجة...' : `تأكيد ودفع ${selectedPkg.price} ج.م`}
                </button>
              </form>

              {/* Order Summary */}
              <div style={{ background: 'rgba(0,0,0,0.3)', padding: 24, borderRadius: 16, height: 'fit-content' }}>
                <h3 style={{ marginBottom: 16 }}>ملخص الطلب</h3>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12, color: 'var(--text-secondary)' }}>
                  <span>الخدمة:</span>
                  <span style={{ color: 'var(--text-primary)' }}>{service.name}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12, color: 'var(--text-secondary)' }}>
                  <span>الباقة:</span>
                  <span style={{ color: 'var(--text-primary)' }}>{selectedPkg.name}</span>
                </div>
                <div style={{ height: 1, background: 'var(--border-glass)', margin: '16px 0' }} />
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 24, fontSize: '1.2rem', fontWeight: 'bold' }}>
                  <span>الإجمالي:</span>
                  <span style={{ color: 'var(--accent-green-bright)' }}>{selectedPkg.price} ج.م</span>
                </div>

                <div style={{ background: 'rgba(255,255,255,0.02)', padding: 16, borderRadius: 12, border: '1px solid rgba(255,255,255,0.05)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}><Wallet size={16}/> رصيدك الحالي:</span>
                    <span style={{ fontWeight: 'bold' }}>{userWallet} ج.م</span>
                  </div>
                  {userWallet < selectedPkg.price ? (
                    <div style={{ color: 'var(--accent-red)', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: 6, marginTop: 12 }}>
                      <AlertCircle size={14} /> رصيدك غير كافٍ. <Link to="/dashboard" style={{ color: 'var(--accent-blue-bright)' }}>اشحن محفظتك الآن</Link>
                    </div>
                  ) : (
                    <div style={{ color: 'var(--accent-green-bright)', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: 6, marginTop: 12 }}>
                      <Check size={14} /> رصيدك يكفي لإتمام هذه العملية.
                    </div>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
