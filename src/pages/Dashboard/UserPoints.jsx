// Freskvv Tec EG — User Points Page
import { useState, useEffect } from 'react';
import { collection, query, where, orderBy, onSnapshot } from 'firebase/firestore';
import { db } from '../../firebase/config';
import { useAuth } from '../../contexts/AuthContext';
import { Star, ArrowRight, Gift, ShoppingBag, Wallet, MessageSquare, TrendingUp, Award } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import './Dashboard.css';

// نظام المستويات
const LEVELS = [
  { name: 'برونزي', min: 0,    max: 500,  color: '#cd7f32', icon: '🥉', perks: 'وصول أساسي للخدمات' },
  { name: 'فضي',   min: 500,  max: 1500, color: '#9ca3af', icon: '🥈', perks: 'خصم 5% على جميع الخدمات' },
  { name: 'ذهبي',  min: 1500, max: 3500, color: '#eab308', icon: '🥇', perks: 'خصم 10% + أولوية في الدعم' },
  { name: 'ألماسي',min: 3500, max: 7500, color: '#22d3ee', icon: '💎', perks: 'خصم 15% + خدمات حصرية' },
  { name: 'أسطوري',min: 7500, max: Infinity, color: '#a855f7', icon: '👑', perks: 'خصم 20% + VIP مدى الحياة' },
];

const HOW_TO_EARN = [
  { icon: <Wallet size={20} />, title: 'إيداع رصيد', desc: 'احصل على 10 نقطة مقابل كل 10 ج.م إيداع', color: '#4f9fff' },
  { icon: <ShoppingBag size={20} />, title: 'طلب خدمة', desc: 'احصل على 20 نقطة مقابل كل طلب مكتمل', color: '#8b5cf6' },
  { icon: <MessageSquare size={20} />, title: 'مراجعة معتمدة', desc: 'احصل على 50 نقطة لكل رأي يتم نشره', color: '#22c55e' },
  { icon: <Gift size={20} />, title: 'كود الدعوة', desc: 'احصل على 100 نقطة لكل صديق تدعوه', color: '#f59e0b' },
];

function getCurrentLevel(points) {
  return LEVELS.findLast(l => points >= l.min) || LEVELS[0];
}

function getNextLevel(points) {
  return LEVELS.find(l => l.min > points) || null;
}

const staggerContainer = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.08 } }
};
const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 80, damping: 20 } }
};

export default function UserPoints() {
  const { currentUser, userProfile } = useAuth();
  const [pointsHistory, setPointsHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  const points = userProfile?.points ?? 0;
  const currentLevel = getCurrentLevel(points);
  const nextLevel = getNextLevel(points);
  const progressPct = nextLevel
    ? Math.round(((points - currentLevel.min) / (nextLevel.min - currentLevel.min)) * 100)
    : 100;

  useEffect(() => {
    if (!currentUser) return;
    // جلب المعاملات التي تُضيف نقاط فقط
    const q = query(
      collection(db, 'transactions'),
      where('uid', '==', currentUser.uid),
      orderBy('createdAt', 'desc')
    );
    const unsub = onSnapshot(q, snap => {
      const all = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      // نعرض فقط المعاملات اللي ليها نقاط أو كل المعاملات كمرجع
      setPointsHistory(all);
      setLoading(false);
    });
    return unsub;
  }, [currentUser]);

  const formatDate = ts => {
    if (!ts) return '';
    const d = ts.toDate ? ts.toDate() : new Date(ts);
    return d.toLocaleDateString('ar-EG', { day: '2-digit', month: '2-digit', year: 'numeric' });
  };

  // حساب النقاط المكتسبة من كل معاملة (تقريبي)
  const getTransactionPoints = tx => {
    if (tx.type === 'spend') return Math.floor((tx.amount || 0) / 10) * 5;
    if (tx.type === 'deposit') return Math.floor((tx.amount || 0) / 10) * 10;
    return 0;
  };

  return (
    <div className="dashboard-page" style={{ paddingTop: 100 }}>
      <div className="container">

        {/* Header */}
        <div style={{ marginBottom: 32 }}>
          <Link to="/dashboard" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, color: 'var(--text-secondary)', textDecoration: 'none', marginBottom: 20, fontSize: 14, background: 'rgba(255,255,255,0.04)', padding: '7px 16px', borderRadius: 99, border: '1px solid var(--border-glass)' }}>
            <ArrowRight size={16} /> العودة للوحة التحكم
          </Link>
          <h1 style={{ fontSize: '2rem', fontWeight: 900, display: 'flex', alignItems: 'center', gap: 12, marginBottom: 6 }}>
            <Star size={28} color="#facc15" fill="#facc15" /> نقاطي
          </h1>
          <p style={{ color: 'var(--text-muted)' }}>اكسب نقاطاً على كل معاملة واستبدلها بمزايا حصرية</p>
        </div>

        {/* Level Card */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          style={{
            background: `linear-gradient(135deg, rgba(0,0,0,0.4), rgba(0,0,0,0.2))`,
            border: `1px solid ${currentLevel.color}44`,
            borderRadius: 24,
            padding: '32px 36px',
            marginBottom: 24,
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          {/* Glow */}
          <div style={{ position: 'absolute', top: -60, right: -60, width: 200, height: 200, borderRadius: '50%', background: currentLevel.color, opacity: 0.07, filter: 'blur(40px)' }} />

          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 20, marginBottom: 24 }}>
            <div>
              <div style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 8 }}>مستواك الحالي</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{ fontSize: 36 }}>{currentLevel.icon}</span>
                <div>
                  <div style={{ fontSize: '1.8rem', fontWeight: 900, color: currentLevel.color }}>{currentLevel.name}</div>
                  <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{currentLevel.perks}</div>
                </div>
              </div>
            </div>
            <div style={{ textAlign: 'left' }}>
              <div style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 4 }}>إجمالي نقاطك</div>
              <div style={{ fontSize: '3rem', fontWeight: 900, color: '#facc15', lineHeight: 1 }}>
                {points.toLocaleString('ar-EG')}
              </div>
              <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>نقطة</div>
            </div>
          </div>

          {/* Progress Bar */}
          {nextLevel && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8, fontSize: 13 }}>
                <span style={{ color: 'var(--text-secondary)' }}>
                  {(nextLevel.min - points).toLocaleString('ar-EG')} نقطة للوصول لـ
                  <strong style={{ color: nextLevel.color }}> {nextLevel.name} {nextLevel.icon}</strong>
                </span>
                <span style={{ color: currentLevel.color, fontWeight: 700 }}>{progressPct}%</span>
              </div>
              <div style={{ height: 10, background: 'rgba(255,255,255,0.06)', borderRadius: 99, overflow: 'hidden' }}>
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${progressPct}%` }}
                  transition={{ duration: 1.2, ease: 'easeOut' }}
                  style={{ height: '100%', background: `linear-gradient(90deg, ${currentLevel.color}, ${nextLevel.color})`, borderRadius: 99, boxShadow: `0 0 12px ${currentLevel.color}88` }}
                />
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 6, fontSize: 11, color: 'var(--text-muted)' }}>
                <span>{currentLevel.min.toLocaleString('ar-EG')} نقطة</span>
                <span>{nextLevel.min.toLocaleString('ar-EG')} نقطة</span>
              </div>
            </div>
          )}
          {!nextLevel && (
            <div style={{ background: 'rgba(168,85,247,0.1)', border: '1px solid rgba(168,85,247,0.3)', borderRadius: 12, padding: '12px 20px', textAlign: 'center', color: '#a855f7', fontWeight: 700 }}>
              👑 لقد وصلت للمستوى الأسطوري! استمتع بكل المزايا الحصرية
            </div>
          )}
        </motion.div>

        {/* All Levels */}
        <motion.div initial="hidden" animate="show" variants={staggerContainer} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 12, marginBottom: 32 }}>
          {LEVELS.map((level) => {
            const isActive = currentLevel.name === level.name;
            return (
              <motion.div key={level.name} variants={fadeUp} style={{
                background: isActive ? `${level.color}15` : 'rgba(255,255,255,0.02)',
                border: `1px solid ${isActive ? level.color + '60' : 'var(--border-glass)'}`,
                borderRadius: 14,
                padding: '16px',
                textAlign: 'center',
                transition: 'all 0.3s',
                position: 'relative',
              }}>
                {isActive && (
                  <div style={{ position: 'absolute', top: 8, left: 8, background: level.color, color: 'white', fontSize: 9, fontWeight: 700, padding: '2px 7px', borderRadius: 99 }}>
                    أنت هنا
                  </div>
                )}
                <div style={{ fontSize: 28, marginBottom: 6 }}>{level.icon}</div>
                <div style={{ fontWeight: 800, color: level.color, marginBottom: 4 }}>{level.name}</div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                  {level.max === Infinity ? `${level.min.toLocaleString()}+` : `${level.min.toLocaleString()} — ${level.max.toLocaleString()}`}
                </div>
                <div style={{ fontSize: 11, color: 'var(--text-secondary)', marginTop: 6 }}>{level.perks}</div>
              </motion.div>
            );
          })}
        </motion.div>

        {/* How to Earn */}
        <h2 className="dashboard-section-title" style={{ marginBottom: 16 }}>
          <TrendingUp size={20} style={{ display: 'inline', marginLeft: 8, color: 'var(--accent-blue)' }} />
          كيف تكسب النقاط؟
        </h2>
        <motion.div initial="hidden" animate="show" variants={staggerContainer} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 14, marginBottom: 32 }}>
          {HOW_TO_EARN.map(item => (
            <motion.div key={item.title} variants={fadeUp} style={{
              background: 'rgba(255,255,255,0.03)',
              border: '1px solid var(--border-glass)',
              borderRadius: 14,
              padding: '20px',
              display: 'flex',
              gap: 14,
              alignItems: 'flex-start',
            }}>
              <div style={{ width: 40, height: 40, borderRadius: '50%', background: `${item.color}18`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: item.color, flexShrink: 0 }}>
                {item.icon}
              </div>
              <div>
                <div style={{ fontWeight: 700, marginBottom: 4 }}>{item.title}</div>
                <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>{item.desc}</div>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Redeem CTA */}
        <div style={{ background: 'linear-gradient(135deg, rgba(79,159,255,0.08), rgba(139,92,246,0.08))', border: '1px solid rgba(79,159,255,0.2)', borderRadius: 20, padding: '28px 32px', marginBottom: 40, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <div style={{ width: 52, height: 52, borderRadius: '50%', background: 'rgba(79,159,255,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Award size={24} color="var(--accent-blue)" />
            </div>
            <div>
              <div style={{ fontWeight: 800, fontSize: '1.1rem', marginBottom: 4 }}>استبدل نقاطك</div>
              <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>ادخل المحفظة وفعّل كود خصم للاستفادة من نقاطك</div>
            </div>
          </div>
          <Link to="/dashboard/wallet" className="btn-primary" style={{ padding: '10px 28px' }}>
            <Gift size={16} /> استبدال النقاط
          </Link>
        </div>

        {/* Points History */}
        <h2 className="dashboard-section-title" style={{ marginBottom: 16 }}>سجل النشاط</h2>
        {loading ? (
          <div style={{ textAlign: 'center', padding: 40, color: 'var(--text-muted)' }}>جاري التحميل...</div>
        ) : pointsHistory.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 60, background: 'rgba(255,255,255,0.02)', borderRadius: 16, border: '1px solid var(--border-glass)' }}>
            <Star size={48} style={{ color: 'var(--text-muted)', opacity: 0.3, margin: '0 auto 16px' }} />
            <div style={{ fontWeight: 700, marginBottom: 8 }}>لا يوجد نشاط بعد</div>
            <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>ابدأ بشراء خدمة أو إيداع رصيد لكسب نقاطك الأولى!</div>
          </div>
        ) : (
          <div className="transactions-list">
            {pointsHistory.slice(0, 20).map(tx => {
              const pts = getTransactionPoints(tx);
              return (
                <div key={tx.id} className="transaction-item">
                  <div className={`transaction-icon ${tx.type === 'deposit' ? 'deposit' : 'spend'}`}>
                    <Star size={18} />
                  </div>
                  <div className="transaction-info">
                    <div className="transaction-label">{tx.description || (tx.type === 'deposit' ? 'إيداع رصيد' : 'إنفاق')}</div>
                    <div className="transaction-date">{formatDate(tx.createdAt)}</div>
                  </div>
                  {pts > 0 ? (
                    <div style={{ color: '#facc15', fontWeight: 700, fontSize: '0.95rem' }}>+{pts} نقطة ⭐</div>
                  ) : (
                    <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>—</div>
                  )}
                </div>
              );
            })}
          </div>
        )}

      </div>
    </div>
  );
}
