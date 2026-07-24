// Freskvv Tec EG — User Dashboard
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Wallet, Package, Clock, Star, Bell, MessageCircle, Settings, ChevronLeft, ChevronRight } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useSettings } from '../../contexts/SettingsContext';
import { collection, onSnapshot, query, orderBy, where } from 'firebase/firestore';
import { db } from '../../firebase/config';
import { getTranslation } from '../../utils/translations';
import { isFeatureNew } from '../../utils/newBadge';
import './Dashboard.css';

export default function Dashboard() {
  const { currentUser, userProfile } = useAuth();
  const { language } = useSettings();
  const isAr = language === 'ar';
  const t = (key) => getTranslation(language, key);

  const [notifCount, setNotifCount] = useState(0);
  const [activeOrdersCount, setActiveOrdersCount] = useState(0);

  useEffect(() => {
    if (!currentUser) return;
    
    // Notifications count
    const unsubNotif = onSnapshot(collection(db, 'global_notifications'), snap => {
      setNotifCount(snap.docs.length);
    });

    // Active orders count
    const qOrders = query(collection(db, 'orders'), where('userId', '==', currentUser.uid), where('status', 'in', ['pending', 'in-progress']));
    const unsubOrders = onSnapshot(qOrders, snap => {
      setActiveOrdersCount(snap.docs.length);
    });

    return () => { unsubNotif(); unsubOrders(); };
  }, [currentUser]);

  const getGreeting = () => {
    const h = new Date().getHours();
    if (h < 12) return t('dashGreetingMorning');
    if (h < 17) return t('dashGreetingAfternoon');
    return t('dashGreetingEvening');
  };

  const quickLinks = [
    { icon: <Wallet size={22} />, label: t('navWallet'), to: '/dashboard/wallet', color: '#4f9fff' },
    { icon: '🎮', label: t('navGameStore'), to: '/game-store', color: '#8b5cf6' },
    { icon: <Package size={22} />, label: t('dashMyOrders'), to: '/dashboard/orders', color: '#22d3ee' },
    { icon: <Star size={22} />, label: t('dashMyPoints'), to: '/dashboard/points', color: '#f59e0b' },
    { icon: <MessageCircle size={22} />, label: t('dashSupport'), to: '/dashboard/support', color: '#10b981' },
    { icon: <Settings size={22} />, label: t('navSettings'), to: '/dashboard/settings', color: '#6b7280' },
  ];

  return (
    <div className="dashboard-page">
      <div className="container">
        {/* Header */}
        <div className="dashboard-header">
          <div>
            <div className="dashboard-greeting">{getGreeting()}</div>
            <h1 className="dashboard-name">
              {userProfile?.fullName?.split(' ')[0] || t('navDashboard')} 👋
            </h1>
          </div>
          <Link to="/dashboard/notifications" className="dashboard-notif-btn">
            <Bell size={20} />
            {notifCount > 0 && <span className="notif-badge">{notifCount}</span>}
          </Link>
        </div>

        {/* Stats Row */}
        <div className="dashboard-stats">
          <div className="dashboard-stat-card">
            <div className="dashboard-stat-icon" style={{ background: 'rgba(79,159,255,0.15)', color: '#4f9fff' }}>
              <Wallet size={20} />
            </div>
            <div>
              <div className="dashboard-stat-val">{userProfile?.walletBalance ?? 0} {t('currency')}</div>
              <div className="dashboard-stat-label">{t('dashWalletBalance')}</div>
            </div>
          </div>

          <div className="dashboard-stat-card">
            <div className="dashboard-stat-icon" style={{ background: 'rgba(139,92,246,0.15)', color: '#8b5cf6' }}>
              <Star size={20} />
            </div>
            <div>
              <div className="dashboard-stat-val">{userProfile?.points ?? 0}</div>
              <div className="dashboard-stat-label">{t('dashPointsEarned')}</div>
            </div>
          </div>

          <div className="dashboard-stat-card">
            <div className="dashboard-stat-icon" style={{ background: 'rgba(34,211,238,0.15)', color: '#22d3ee' }}>
              <Package size={20} />
            </div>
            <div>
              <div className="dashboard-stat-val">{activeOrdersCount}</div>
              <div className="dashboard-stat-label">{t('dashActiveOrders')}</div>
            </div>
          </div>
        </div>

        {/* Wallet Card */}
        <div className="wallet-preview-card">
          <div className="wallet-preview-left">
            <div className="wallet-preview-label">{t('dashQuickWallet')}</div>
            <div className="wallet-preview-amount">{userProfile?.walletBalance ?? 0}<span> {t('currency')}</span></div>
            <div style={{ display: 'flex', gap: 'var(--space-3)', marginTop: 'var(--space-4)' }}>
              <Link to="/dashboard/wallet" className="btn-primary" style={{ fontSize: 'var(--font-size-sm)', padding: 'var(--space-2) var(--space-5)' }}>
                {t('dashDepositBtn')}
              </Link>
              <Link to="/dashboard/wallet" className="btn-ghost" style={{ fontSize: 'var(--font-size-sm)', padding: 'var(--space-2) var(--space-5)' }}>
                {t('dashHistoryBtn')}
              </Link>
            </div>
          </div>
          <div className="wallet-preview-right">
            <div className="wallet-orange-logo">🟠</div>
            <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-muted)', textAlign: 'center' }}>
              {t('dashOrangeDeposit')}
            </div>
          </div>
        </div>

        {/* Quick Links */}
        <h2 className="dashboard-section-title">{t('dashQuickSections')}</h2>
        <div className="dashboard-quick-grid">
          {quickLinks.map(link => {
            const hasNewBadge = isFeatureNew(link.to);
            return (
              <Link key={link.label} to={link.to} className="dashboard-quick-card" style={{ position: 'relative' }}>
                <div className="dashboard-quick-icon" style={{ color: link.color, background: `${link.color}18` }}>
                  {typeof link.icon === 'string' ? link.icon : link.icon}
                </div>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                  {link.label}
                  {hasNewBadge && (
                    <span className="new-badge">
                      {t('badgeNew')}
                    </span>
                  )}
                </span>
                {isAr ? (
                  <ChevronLeft size={14} style={{ color: 'var(--text-muted)', marginRight: 'auto' }} />
                ) : (
                  <ChevronRight size={14} style={{ color: 'var(--text-muted)', marginLeft: 'auto' }} />
                )}
              </Link>
            );
          })}
        </div>

        {/* Recent Orders Placeholder */}
        <h2 className="dashboard-section-title">{t('dashRecentOrders')}</h2>
        <div className="dashboard-empty">
          <div style={{ fontSize: 48, marginBottom: 'var(--space-4)' }}>📦</div>
          <div style={{ fontWeight: 700, marginBottom: 'var(--space-2)' }}>{t('dashRecentOrders')}</div>
          <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-muted)', marginBottom: 'var(--space-6)' }}>
            {t('dashOrdersDesc')}
          </div>
          <Link to="/dashboard/orders" className="btn-primary">{t('dashViewOrdersBtn')}</Link>
        </div>
      </div>
    </div>
  );
}
