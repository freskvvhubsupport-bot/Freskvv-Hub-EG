import { useState, useEffect } from 'react';
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore';
import { db } from '../../firebase/config';
import { Bell, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

export default function Notifications() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch global notifications
    const q = query(collection(db, 'global_notifications'), orderBy('createdAt', 'desc'));
    const unsub = onSnapshot(q, snap => {
      setNotifications(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      setLoading(false);
    });
    return unsub;
  }, []);

  return (
    <div style={{ minHeight: '100vh', paddingTop: 120, paddingBottom: 80 }}>
      <div className="container">
        <div style={{ marginBottom: 32 }}>
          <Link to="/dashboard" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: 'var(--text-secondary)', textDecoration: 'none', marginBottom: 24, fontSize: 14, background: 'rgba(255,255,255,0.05)', padding: '8px 16px', borderRadius: 99, border: '1px solid var(--border-glass)', position: 'relative', zIndex: 10 }}>
            <ArrowRight size={16} /> العودة للوحة التحكم
          </Link>
          <h1 style={{ fontSize: '2rem', display: 'flex', alignItems: 'center', gap: 12 }}>
            <Bell size={28} color="var(--accent-blue)" /> الإشعارات
          </h1>
          <p style={{ color: 'var(--text-muted)' }}>أحدث الإشعارات والتنبيهات الخاصة بحسابك والموقع</p>
        </div>


        {loading ? (
          <div style={{ textAlign: 'center', padding: 40, color: 'var(--text-muted)' }}>جاري تحميل الإشعارات...</div>
        ) : notifications.length === 0 ? (
          <div style={{ background: 'var(--bg-secondary)', padding: 60, borderRadius: 16, textAlign: 'center', border: '1px solid var(--border-glass)' }}>
            <Bell size={48} style={{ color: 'var(--text-muted)', marginBottom: 16, opacity: 0.5 }} />
            <h3 style={{ marginBottom: 8 }}>لا توجد إشعارات جديدة</h3>
            <p style={{ color: 'var(--text-secondary)' }}>ستظهر هنا الإشعارات والتحديثات الهامة</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {notifications.map((n, i) => (
              <motion.div 
                key={n.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                style={{ 
                  background: 'var(--bg-secondary)', 
                  padding: 24, 
                  borderRadius: 12, 
                  border: '1px solid rgba(79,159,255,0.2)',
                  borderRight: '4px solid var(--accent-blue)',
                  position: 'relative'
                }}
              >
                <div style={{ position: 'absolute', top: 12, left: 16, fontSize: 12, color: 'var(--text-muted)' }}>
                  {n.createdAt?.toDate().toLocaleDateString('ar-EG')}
                </div>
                <h3 style={{ marginBottom: 8, color: 'var(--text-primary)', fontSize: '1.1rem' }}>{n.title}</h3>
                <p style={{ color: 'var(--text-secondary)', lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>{n.message}</p>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
