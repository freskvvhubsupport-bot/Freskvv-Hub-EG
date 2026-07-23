// Freskvv Tec EG — Notifications Page (with mark-as-read)
import { useState, useEffect } from 'react';
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore';
import { db } from '../../firebase/config';
import { Bell, ArrowRight, CheckCheck, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

export default function Notifications() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [readIds, setReadIds] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('readNotifIds') || '[]');
    } catch {
      return [];
    }
  });

  useEffect(() => {
    const q = query(collection(db, 'global_notifications'), orderBy('createdAt', 'desc'));
    const unsub = onSnapshot(q, snap => {
      setNotifications(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      setLoading(false);
    });
    return unsub;
  }, []);

  // تحديث الـ localStorage لما تتغير readIds
  useEffect(() => {
    localStorage.setItem('readNotifIds', JSON.stringify(readIds));
  }, [readIds]);

  const markAllRead = () => {
    const allIds = notifications.map(n => n.id);
    setReadIds(allIds);
  };

  const markOneRead = (id) => {
    setReadIds(prev => prev.includes(id) ? prev : [...prev, id]);
  };

  const unreadCount = notifications.filter(n => !readIds.includes(n.id)).length;

  const fadeUp = {
    hidden: { opacity: 0, y: 10 },
    show: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -10 },
  };

  return (
    <div style={{ minHeight: '100vh', paddingTop: 120, paddingBottom: 80 }}>
      <div className="container">
        {/* Header */}
        <div style={{ marginBottom: 32 }}>
          <Link
            to="/dashboard"
            style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: 'var(--text-secondary)', textDecoration: 'none', marginBottom: 24, fontSize: 14, background: 'rgba(255,255,255,0.05)', padding: '8px 16px', borderRadius: 99, border: '1px solid var(--border-glass)' }}
          >
            <ArrowRight size={16} /> العودة للوحة التحكم
          </Link>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
            <div>
              <h1 style={{ fontSize: '2rem', display: 'flex', alignItems: 'center', gap: 12, marginBottom: 4 }}>
                <Bell size={28} color="var(--accent-blue)" /> الإشعارات
                {unreadCount > 0 && (
                  <span style={{ background: '#ef4444', color: 'white', fontSize: 12, fontWeight: 700, padding: '2px 10px', borderRadius: 99 }}>
                    {unreadCount} جديد
                  </span>
                )}
              </h1>
              <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>أحدث الإشعارات والتنبيهات الخاصة بحسابك والموقع</p>
            </div>
            {unreadCount > 0 && (
              <button
                onClick={markAllRead}
                style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'rgba(79,159,255,0.1)', border: '1px solid rgba(79,159,255,0.2)', color: 'var(--accent-blue-bright)', padding: '9px 18px', borderRadius: 99, cursor: 'pointer', fontSize: 13, fontFamily: 'var(--font-primary)', fontWeight: 600, transition: 'all 0.2s' }}
                onMouseEnter={e => e.currentTarget.style.background = 'rgba(79,159,255,0.2)'}
                onMouseLeave={e => e.currentTarget.style.background = 'rgba(79,159,255,0.1)'}
              >
                <CheckCheck size={16} /> تحديد الكل كمقروء
              </button>
            )}
          </div>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: 60, color: 'var(--text-muted)' }}>
            <div style={{ width: 40, height: 40, borderRadius: '50%', border: '3px solid rgba(79,159,255,0.2)', borderTop: '3px solid #4f9fff', animation: 'spin 0.7s linear infinite', margin: '0 auto 16px' }} />
            جاري تحميل الإشعارات...
          </div>
        ) : notifications.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            style={{ background: 'rgba(255,255,255,0.02)', padding: 80, borderRadius: 20, textAlign: 'center', border: '1px solid var(--border-glass)' }}
          >
            <Bell size={52} style={{ color: 'var(--text-muted)', marginBottom: 16, opacity: 0.3 }} />
            <h3 style={{ marginBottom: 8 }}>لا توجد إشعارات جديدة</h3>
            <p style={{ color: 'var(--text-secondary)' }}>ستظهر هنا الإشعارات والتحديثات الهامة</p>
          </motion.div>
        ) : (
          <motion.div
            initial="hidden"
            animate="show"
            style={{ display: 'flex', flexDirection: 'column', gap: 14 }}
          >
            <AnimatePresence>
              {notifications.map((n, i) => {
                const isRead = readIds.includes(n.id);
                return (
                  <motion.div
                    key={n.id}
                    variants={fadeUp}
                    initial="hidden"
                    animate="show"
                    transition={{ delay: i * 0.04 }}
                    onClick={() => markOneRead(n.id)}
                    style={{
                      background: isRead ? 'rgba(255,255,255,0.02)' : 'rgba(79,159,255,0.05)',
                      padding: '22px 24px',
                      borderRadius: 16,
                      border: isRead
                        ? '1px solid var(--border-glass)'
                        : '1px solid rgba(79,159,255,0.25)',
                      borderRight: isRead ? '4px solid var(--border-glass)' : '4px solid var(--accent-blue)',
                      position: 'relative',
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                    }}
                    whileHover={{ scale: 1.005 }}
                  >
                    {/* Unread dot */}
                    {!isRead && (
                      <div style={{ position: 'absolute', top: 20, left: 20, width: 9, height: 9, borderRadius: '50%', background: 'var(--accent-blue)', boxShadow: '0 0 8px var(--accent-blue)' }} />
                    )}

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 }}>
                      <div style={{ flex: 1 }}>
                        {/* Icon + Title */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                          <Sparkles size={16} color={isRead ? 'var(--text-muted)' : 'var(--accent-blue)'} />
                          <h3 style={{ fontSize: '1rem', color: isRead ? 'var(--text-secondary)' : 'var(--text-primary)', fontWeight: isRead ? 600 : 800 }}>
                            {n.title}
                          </h3>
                        </div>
                        <p style={{ color: 'var(--text-secondary)', lineHeight: 1.7, fontSize: 14, whiteSpace: 'pre-wrap' }}>{n.message}</p>
                      </div>
                      <div style={{ textAlign: 'left', flexShrink: 0 }}>
                        <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 8 }}>
                          {n.createdAt?.toDate?.()?.toLocaleDateString('ar-EG')}
                        </div>
                        {isRead ? (
                          <span style={{ fontSize: 11, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 4 }}>
                            <CheckCheck size={12} /> مقروء
                          </span>
                        ) : (
                          <span style={{ fontSize: 11, background: 'rgba(79,159,255,0.15)', color: 'var(--accent-blue-bright)', padding: '3px 10px', borderRadius: 99, fontWeight: 700 }}>
                            جديد
                          </span>
                        )}
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </motion.div>
        )}
      </div>
    </div>
  );
}
