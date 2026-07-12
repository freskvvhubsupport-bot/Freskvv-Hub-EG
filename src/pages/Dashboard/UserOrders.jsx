// Freskvv Tec EG — User Orders
import { useState, useEffect } from 'react';
import { collection, query, where, orderBy, onSnapshot } from 'firebase/firestore';
import { db } from '../../firebase/config';
import { useAuth } from '../../contexts/AuthContext';
import { Package, Clock, CheckCircle2, XCircle, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

export default function UserOrders() {
  const { currentUser } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!currentUser) return;
    const q = query(
      collection(db, 'orders'),
      where('userId', '==', currentUser.uid),
      orderBy('createdAt', 'desc')
    );
    
    const unsub = onSnapshot(q, snap => {
      setOrders(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      setLoading(false);
    });
    return unsub;
  }, [currentUser]);

  const getStatusBadge = (status) => {
    switch (status) {
      case 'pending': return <span style={{ background: 'rgba(245, 158, 11, 0.2)', color: '#f59e0b', padding: '6px 12px', borderRadius: 6, fontSize: 13, display: 'inline-flex', alignItems: 'center', gap: 6 }}><Clock size={14} /> قيد الانتظار</span>;
      case 'in-progress': return <span style={{ background: 'rgba(79, 159, 255, 0.2)', color: 'var(--accent-blue)', padding: '6px 12px', borderRadius: 6, fontSize: 13, display: 'inline-flex', alignItems: 'center', gap: 6 }}><Package size={14} /> جاري التنفيذ</span>;
      case 'completed': return <span style={{ background: 'rgba(34, 197, 94, 0.2)', color: '#22c55e', padding: '6px 12px', borderRadius: 6, fontSize: 13, display: 'inline-flex', alignItems: 'center', gap: 6 }}><CheckCircle2 size={14} /> مكتمل</span>;
      case 'cancelled': return <span style={{ background: 'rgba(239, 68, 68, 0.2)', color: '#ef4444', padding: '6px 12px', borderRadius: 6, fontSize: 13, display: 'inline-flex', alignItems: 'center', gap: 6 }}><XCircle size={14} /> ملغي المسترد</span>;
      default: return null;
    }
  };

  return (
    <div className="dashboard-page">
      <div className="container">
        <div style={{ marginBottom: 32 }}>
          <Link to="/dashboard" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, color: 'var(--text-secondary)', textDecoration: 'none', marginBottom: 16 }}>
            <ArrowRight size={18} /> العودة للوحة التحكم
          </Link>
          <h1 style={{ fontSize: '2rem', display: 'flex', alignItems: 'center', gap: 12 }}>
            <Package size={28} color="var(--accent-blue)" /> طلباتي
          </h1>
          <p style={{ color: 'var(--text-muted)' }}>تابع حالة طلباتك للخدمات والمشاريع التي طلبتها</p>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: 40, color: 'var(--text-muted)' }}>جاري تحميل الطلبات...</div>
        ) : orders.length === 0 ? (
          <div style={{ background: 'var(--bg-secondary)', padding: 60, borderRadius: 16, textAlign: 'center', border: '1px solid var(--border-glass)' }}>
            <Package size={48} style={{ color: 'var(--text-muted)', marginBottom: 16, opacity: 0.5 }} />
            <h3 style={{ marginBottom: 8 }}>لا توجد طلبات بعد</h3>
            <p style={{ color: 'var(--text-secondary)', marginBottom: 24 }}>تصفح الخدمات واطلب ما تحتاجه الآن</p>
            <Link to="/services" className="btn-primary" style={{ display: 'inline-flex' }}>استكشف الخدمات</Link>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 24 }}>
            {orders.map((order, i) => (
              <motion.div 
                key={order.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                style={{ 
                  background: 'var(--bg-secondary)', 
                  padding: 24, 
                  borderRadius: 16, 
                  border: '1px solid rgba(255,255,255,0.05)',
                  position: 'relative'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
                  <div>
                    <h3 style={{ marginBottom: 4, color: 'var(--text-primary)', fontSize: '1.2rem' }}>{order.serviceName}</h3>
                    <div style={{ color: 'var(--text-secondary)', fontSize: 14 }}>{order.packageName}</div>
                  </div>
                  <div style={{ fontWeight: 'bold', color: 'var(--accent-green-bright)', fontSize: '1.2rem' }}>
                    {order.price} ج.م
                  </div>
                </div>

                <div style={{ background: 'rgba(0,0,0,0.2)', padding: 12, borderRadius: 8, marginBottom: 16 }}>
                  <div style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 4 }}>المشروع/الدومين:</div>
                  <div style={{ fontWeight: 600 }}>{order.projectName}</div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--border-glass)', paddingTop: 16, marginTop: 'auto' }}>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                    {order.createdAt?.toDate().toLocaleDateString('ar-EG')}
                  </div>
                  {getStatusBadge(order.status)}
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
