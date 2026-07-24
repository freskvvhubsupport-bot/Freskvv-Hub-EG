// Freskvv Tec EG — Navbar Component
import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Bell, Wallet, User, LogOut, Settings, LayoutDashboard, Menu, X, CheckCircle2, Globe, Star, MessageSquare } from 'lucide-react';
import { collection, onSnapshot, doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../firebase/config';
import { useAuth } from '../../contexts/AuthContext';
import { useSettings } from '../../contexts/SettingsContext';
import { getTranslation } from '../../utils/translations';
import { isFeatureNew } from '../../utils/newBadge';
import './Navbar.css';

const NAV_ITEMS = [
  { key: 'navHome', to: '/' },
  { key: 'navServices', to: '/services' },
  { key: 'navGameStore', to: '/game-store' },
  { key: 'navCustom', to: '/custom-service' },
  { key: 'navReviews', to: '/community' },
  { key: 'navAcademy', to: '/learning' },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [notifCount, setNotifCount] = useState(0);
  const { currentUser, userProfile, isAdmin, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const dropdownRef = useRef(null);
  const { language, changeLanguage, toggleTheme, theme } = useSettings();

  const isAr = language === 'ar';
  const t = (key) => getTranslation(language, key);

  // Real-time unread global notifications listener
  useEffect(() => {
    const unsub = onSnapshot(collection(db, 'global_notifications'), snap => {
      const readIds = JSON.parse(localStorage.getItem('readNotifIds') || '[]');
      const unread = snap.docs.filter(d => !readIds.includes(d.id)).length;
      setNotifCount(unread);
    });
    return unsub;
  }, []);

  // Auto publish feature release notification to global_notifications
  useEffect(() => {
    const publishReleaseNotif = async () => {
      try {
        const notifDoc = doc(db, 'global_notifications', 'release_v2_features');
        const snap = await getDoc(notifDoc);
        if (!snap.exists()) {
          await setDoc(notifDoc, {
            title: '🚀 إطلاق التحديثات والمميزات الجديدة في المنصة!',
            message: 'يسعدنا الإعلان عن إطلاق: 1. معرض الأعمال 2. طلب خدمة مخصصة 3. متجر الألعاب 4. نظام النقاط والمكافآت ⭐ 5. دعم اللغتين العربية والإنجليزية وتحسين التصفح للموبايل!',
            createdAt: serverTimestamp(),
            type: 'announcement'
          });
        }
      } catch (err) {
        console.error('Error publishing release notif:', err);
      }
    };
    publishReleaseNotif();
  }, []);

  const toggleLanguage = () => {
    const newLang = isAr ? 'en' : 'ar';
    changeLanguage(newLang);
  };

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const handleClick = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  useEffect(() => setMobileOpen(false), [location.pathname]);

  const handleLogout = async () => {
    setDropdownOpen(false);
    setMobileOpen(false);
    await logout();
    navigate('/');
  };

  const getInitials = () => {
    if (userProfile?.fullName) {
      return userProfile.fullName.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
    }
    return currentUser?.email?.[0]?.toUpperCase() || 'U';
  };

  return (
    <>
      <nav className={`navbar ${scrolled ? 'scrolled' : ''}`}>
        <div className="container">
          <div className="navbar-inner">

            {/* Logo */}
            <Link to="/" className="navbar-logo">
              <div className="navbar-logo-pill">
                <img src="/logo.svg" alt="Freskvv Tec" style={{ width: 24, height: 24 }} />
                <span className="navbar-logo-text">Freskvv Tec EG</span>
                <div className="navbar-verified" title="موقع موثق">
                  <CheckCircle2 size={12} color="white" strokeWidth={3} />
                </div>
              </div>
            </Link>

            {/* Desktop Nav Links */}
            <ul className="navbar-links">
              {NAV_ITEMS.map((item) => {
                const hasNewBadge = isFeatureNew(item.to);
                return (
                  <li key={item.to}>
                    <Link
                      to={item.to}
                      className={`navbar-link ${location.pathname === item.to ? 'active' : ''}`}
                    >
                      <span>{t(item.key)}</span>
                      {hasNewBadge && (
                        <span className="new-badge">
                          {t('badgeNew')}
                        </span>
                      )}
                    </Link>
                  </li>
                );
              })}
            </ul>

            {/* Actions / Auth Area */}
            <div className="navbar-actions">
              {/* Language & Theme Toggles (Desktop / Tablet) */}
              <div className="navbar-toggles-wrap">
                <button
                  className="navbar-lang-btn"
                  onClick={toggleTheme}
                  title="تغيير المظهر"
                >
                  {theme === 'midnight' ? '🌙' : theme === 'light' ? '☀️' : '⚡'}
                </button>
                <button
                  className="navbar-lang-btn"
                  onClick={toggleLanguage}
                  title={isAr ? 'Switch to English' : 'التحويل للعربية'}
                >
                  <Globe size={15} />
                  <span>{isAr ? 'EN' : 'عربي'}</span>
                </button>
              </div>

              {currentUser ? (
                <>
                  {/* User Profile Avatar Dropdown */}
                  <div style={{ position: 'relative' }} ref={dropdownRef}>
                    <button
                      className="navbar-avatar"
                      onClick={() => setDropdownOpen(v => !v)}
                      title={userProfile?.fullName || t('navDashboard')}
                      aria-label="User Menu"
                    >
                      {getInitials()}
                    </button>

                    {dropdownOpen && (
                      <div className="navbar-dropdown">
                        <div className="navbar-dropdown-header">
                          <div className="navbar-dropdown-name">
                            {userProfile?.fullName || 'المستخدم'}
                          </div>
                          <div className="navbar-dropdown-email">
                            {currentUser.email}
                          </div>
                        </div>

                        <Link to="/dashboard" className="navbar-dropdown-item" onClick={() => setDropdownOpen(false)}>
                          <User size={16} />
                          {t('navDashboard')}
                        </Link>
                        <Link to="/dashboard/wallet" className="navbar-dropdown-item" onClick={() => setDropdownOpen(false)}>
                          <Wallet size={16} />
                          {t('navWallet')} ({userProfile?.walletBalance ?? 0} {t('currency')})
                        </Link>
                        <Link to="/dashboard/notifications" className="navbar-dropdown-item" onClick={() => setDropdownOpen(false)}>
                          <Bell size={16} />
                          الإشعارات {notifCount > 0 && <span className="dropdown-notif-badge">{notifCount}</span>}
                        </Link>
                        <Link to="/dashboard/settings" className="navbar-dropdown-item" onClick={() => setDropdownOpen(false)}>
                          <Settings size={16} />
                          {t('navSettings')}
                        </Link>

                        {isAdmin && (
                          <>
                            <div className="dropdown-divider" />
                            <Link to="/admin" className="navbar-dropdown-item" onClick={() => setDropdownOpen(false)}>
                              <LayoutDashboard size={16} />
                              {t('navAdmin')}
                            </Link>
                          </>
                        )}

                        <div className="dropdown-divider" />
                        <button className="navbar-dropdown-item danger" onClick={handleLogout}>
                          <LogOut size={16} />
                          {t('navLogout')}
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Notification Bell Button */}
                  <button 
                    className="navbar-notification-btn" 
                    onClick={() => navigate('/dashboard/notifications')}
                    title="الإشعارات"
                    aria-label="Notifications"
                  >
                    <Bell size={18} />
                    {notifCount > 0 && <span className="notification-badge-count">{notifCount}</span>}
                  </button>

                  {/* Wallet Balance Pill */}
                  <button
                    className="navbar-wallet"
                    onClick={() => navigate('/dashboard/wallet')}
                    title={t('navWallet')}
                  >
                    <Wallet size={15} />
                    <span>{userProfile?.walletBalance ?? 0} {t('currency')}</span>
                  </button>
                </>
              ) : (
                <div className="navbar-auth-btns">
                  <Link to="/auth/login" className="btn-ghost" style={{ padding: '7px 16px', fontSize: '13px' }}>
                    {t('navLogin')}
                  </Link>
                  <Link to="/auth/register" className="btn-primary" style={{ padding: '7px 18px', fontSize: '13px' }}>
                    {t('navRegister')}
                  </Link>
                </div>
              )}

              {/* Mobile Menu Toggle Button */}
              <button 
                className="mobile-menu-btn" 
                onClick={() => setMobileOpen(v => !v)}
                aria-label="Toggle Menu"
              >
                {mobileOpen ? <X size={22} /> : <Menu size={22} />}
              </button>
            </div>

          </div>
        </div>
      </nav>

      {/* Mobile Nav Overlay Drawer */}
      {mobileOpen && (
        <div className="mobile-nav-overlay" onClick={() => setMobileOpen(false)}>
          <div className="mobile-nav-drawer" onClick={e => e.stopPropagation()}>
            
            {/* Drawer Header */}
            <div className="mobile-drawer-header">
              <div className="navbar-logo-pill">
                <img src="/logo.svg" alt="Freskvv Tec" style={{ width: 22, height: 22 }} />
                <span className="navbar-logo-text" style={{ fontSize: '14px' }}>Freskvv Tec EG</span>
              </div>
              <button className="mobile-drawer-close" onClick={() => setMobileOpen(false)}>
                <X size={22} />
              </button>
            </div>

            {/* If Logged In User Card */}
            {currentUser && (
              <div className="mobile-user-card">
                <div className="mobile-user-avatar">
                  {getInitials()}
                </div>
                <div className="mobile-user-info">
                  <div className="mobile-user-name">{userProfile?.fullName || 'المستخدم'}</div>
                  <div className="mobile-user-email">{currentUser.email}</div>
                </div>
                <div className="mobile-user-balance">
                  <span className="balance-val">💳 {userProfile?.walletBalance ?? 0} {t('currency')}</span>
                  <span className="points-val">⭐ {userProfile?.points ?? 0} نقطة</span>
                </div>
              </div>
            )}

            {/* Quick Actions (Toggles) */}
            <div className="mobile-toggles-row">
              <button className="mobile-toggle-btn" onClick={toggleTheme}>
                {theme === 'midnight' ? '🌙 ليلي' : theme === 'light' ? '☀️ نهار' : '⚡ نيون'}
              </button>
              <button className="mobile-toggle-btn highlight" onClick={toggleLanguage}>
                🌐 {isAr ? 'English' : 'العربية'}
              </button>
            </div>

            {/* User Quick Dashboard Links */}
            {currentUser && (
              <div className="mobile-quick-grid">
                <Link to="/dashboard" className="mobile-quick-item" onClick={() => setMobileOpen(false)}>
                  <User size={18} />
                  <span>لوحتي</span>
                </Link>
                <Link to="/dashboard/wallet" className="mobile-quick-item" onClick={() => setMobileOpen(false)}>
                  <Wallet size={18} />
                  <span>المحفظة</span>
                </Link>
                <Link to="/dashboard/notifications" className="mobile-quick-item" onClick={() => setMobileOpen(false)}>
                  <Bell size={18} />
                  <span>الإشعارات {notifCount > 0 && `(${notifCount})`}</span>
                </Link>
                <Link to="/dashboard/support" className="mobile-quick-item" onClick={() => setMobileOpen(false)}>
                  <MessageSquare size={18} />
                  <span>الدعم</span>
                </Link>
              </div>
            )}

            {/* Navigation Links */}
            <div className="mobile-links-section">
              <div className="mobile-section-title">التنقل السريع</div>
              {NAV_ITEMS.map(item => {
                const hasNewBadge = isFeatureNew(item.to);
                return (
                  <Link
                    key={item.to}
                    to={item.to}
                    className={`mobile-nav-item ${location.pathname === item.to ? 'active' : ''}`}
                    onClick={() => setMobileOpen(false)}
                  >
                    <span>{t(item.key)}</span>
                    {hasNewBadge && (
                      <span className="new-badge">{t('badgeNew')}</span>
                    )}
                  </Link>
                );
              })}

              {isAdmin && (
                <Link to="/admin" className="mobile-nav-item admin-link" onClick={() => setMobileOpen(false)}>
                  <LayoutDashboard size={18} />
                  <span>لوحة الأدمن</span>
                </Link>
              )}
            </div>

            {/* Footer Auth Actions */}
            <div className="mobile-drawer-footer">
              {!currentUser ? (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, width: '100%' }}>
                  <Link to="/auth/login" className="btn-ghost" onClick={() => setMobileOpen(false)} style={{ textAlign: 'center' }}>
                    {t('navLogin')}
                  </Link>
                  <Link to="/auth/register" className="btn-primary" onClick={() => setMobileOpen(false)} style={{ textAlign: 'center' }}>
                    {t('navRegister')}
                  </Link>
                </div>
              ) : (
                <button className="btn-ghost danger" onClick={handleLogout} style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                  <LogOut size={16} />
                  {t('navLogout')}
                </button>
              )}
            </div>

          </div>
        </div>
      )}
    </>
  );
}

