// Freskvv Tec EG — Navbar Component
import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Bell, Wallet, User, LogOut, Settings, LayoutDashboard, Menu, X, CheckCircle2, Globe } from 'lucide-react';
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

  // جلب عدد الإشعارات العامة real-time
  useEffect(() => {
    const unsub = onSnapshot(collection(db, 'global_notifications'), snap => {
      // تخزين المقروءة في localStorage
      const readIds = JSON.parse(localStorage.getItem('readNotifIds') || '[]');
      const unread = snap.docs.filter(d => !readIds.includes(d.id)).length;
      setNotifCount(unread);
    });
    return unsub;
  }, []);

  // نشر إشعار تلقائي عام لجميع المستخدمين بالإضافات الجديدة
  useEffect(() => {
    const publishReleaseNotif = async () => {
      try {
        const notifDoc = doc(db, 'global_notifications', 'release_v2_features');
        const snap = await getDoc(notifDoc);
        if (!snap.exists()) {
          await setDoc(notifDoc, {
            title: '🚀 إطلاق التحديثات والمميزات الجديدة في المنصة!',
            message: 'يسعدنا الإعلان عن إطلاق: 1. قسم معرض الأعمال 2. طلب خدمة مخصصة وعرض سعر 3. شحن متجر الألعاب مع الفلترة 4. نظام النقاط والمكافآت ⭐ 5. دعم اللغتين العربية والإنجليزية وتحسين تجربة الموبايل بالكامل!',
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
    await logout();
    navigate('/');
  };

  const getInitials = () => {
    if (userProfile?.fullName) {
      return userProfile.fullName.split(' ').map(n => n[0]).join('').slice(0, 2);
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
                      style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}
                    >
                      {t(item.key)}
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

            {/* Auth / User Area */}
            <div className="navbar-actions">
              {/* Language & Theme Toggle */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <button
                  className="navbar-lang-btn"
                  onClick={toggleTheme}
                  title="تغيير المظهر"
                  style={{ padding: '6px 12px', borderRadius: '20px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border-glass)', cursor: 'pointer', color: 'var(--text-primary)' }}
                >
                  {theme === 'midnight' ? '🌙' : theme === 'light' ? '☀️' : '⚡'}
                </button>
                <button
                  className="navbar-lang-btn"
                  onClick={toggleLanguage}
                  title={isAr ? 'Switch to English' : 'التحويل للعربية'}
                  style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer' }}
                >
                  <Globe size={18} />
                  <span>{isAr ? 'EN' : 'عربي'}</span>
                </button>
              </div>
              {currentUser ? (
                <>
                  {/* Wallet */}
                  <button
                    className="navbar-wallet"
                    onClick={() => navigate('/dashboard/wallet')}
                    title={t('navWallet')}
                  >
                    <Wallet size={16} />
                    <span>{userProfile?.walletBalance ?? 0} {t('currency')}</span>
                  </button>

                  {/* Notifications */}
                  <button className="navbar-notification-btn" onClick={() => navigate('/dashboard/notifications')}>
                    <Bell size={18} />
                    {notifCount > 0 && <span className="notification-dot" />}
                  </button>

                  {/* User Dropdown */}
                  <div style={{ position: 'relative' }} ref={dropdownRef}>
                    <button
                      className="navbar-avatar"
                      onClick={() => setDropdownOpen(v => !v)}
                      title={userProfile?.fullName || t('navDashboard')}
                    >
                      {getInitials()}
                    </button>

                    {dropdownOpen && (
                      <div className="navbar-dropdown">
                        <div style={{ padding: 'var(--space-3) var(--space-4)', borderBottom: '1px solid var(--border-glass)', marginBottom: 'var(--space-2)' }}>
                          <div style={{ fontSize: 'var(--font-size-sm)', fontWeight: 700, color: 'var(--text-primary)' }}>
                            {userProfile?.fullName || 'المستخدم'}
                          </div>
                          <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)', marginTop: 2 }}>
                            {currentUser.email}
                          </div>
                        </div>

                        <Link to="/dashboard" className="navbar-dropdown-item" onClick={() => setDropdownOpen(false)}>
                          <User size={16} />
                          {t('navDashboard')}
                        </Link>
                        <Link to="/dashboard/wallet" className="navbar-dropdown-item" onClick={() => setDropdownOpen(false)}>
                          <Wallet size={16} />
                          {t('navWallet')}
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
                </>
              ) : (
                <>
                  <Link to="/auth/login" className="btn-ghost" style={{ padding: 'var(--space-2) var(--space-5)', fontSize: 'var(--font-size-sm)' }}>
                    {t('navLogin')}
                  </Link>
                  <Link to="/auth/register" className="btn-primary" style={{ padding: 'var(--space-2) var(--space-5)', fontSize: 'var(--font-size-sm)' }}>
                    {t('navRegister')}
                  </Link>
                </>
              )}

              {/* Mobile Menu Toggle */}
              <button className="mobile-menu-btn" onClick={() => setMobileOpen(v => !v)}>
                {mobileOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Nav Overlay */}
      {mobileOpen && (
        <div className="mobile-nav">
          <button
            style={{ position: 'absolute', top: 24, left: 24, background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}
            onClick={() => setMobileOpen(false)}
          >
            <X size={28} />
          </button>

          <div style={{ display: 'flex', gap: 12, marginBottom: 12 }}>
            <button
              onClick={toggleTheme}
              style={{ padding: '8px 16px', borderRadius: '20px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border-glass)', cursor: 'pointer', color: 'var(--text-primary)', fontSize: '14px' }}
            >
              {theme === 'midnight' ? '🌙 Night' : theme === 'light' ? '☀️ Light' : '⚡ Neon'}
            </button>
            <button
              onClick={toggleLanguage}
              style={{ padding: '8px 16px', borderRadius: '20px', background: 'rgba(79,159,255,0.1)', border: '1px solid rgba(79,159,255,0.3)', cursor: 'pointer', color: 'var(--accent-blue-bright)', fontWeight: 'bold', fontSize: '14px' }}
            >
              🌐 {isAr ? 'English' : 'العربية'}
            </button>
          </div>

          {NAV_ITEMS.map(item => {
            const hasNewBadge = isFeatureNew(item.to);
            return (
              <Link key={item.to} to={item.to} className="mobile-nav-link" onClick={() => setMobileOpen(false)} style={{ display: 'flex', alignItems: 'center', gap: 8, justifyContent: 'center' }}>
                {t(item.key)}
                {hasNewBadge && (
                  <span className="new-badge">
                    {t('badgeNew')}
                  </span>
                )}
              </Link>
            );
          })}
          {!currentUser ? (
            <div style={{ display: 'flex', gap: 'var(--space-3)', marginTop: 'var(--space-4)' }}>
              <Link to="/auth/login" className="btn-ghost" onClick={() => setMobileOpen(false)}>{t('navLogin')}</Link>
              <Link to="/auth/register" className="btn-primary" onClick={() => setMobileOpen(false)}>{t('navRegister')}</Link>
            </div>
          ) : (
            <button className="btn-ghost" onClick={handleLogout}>{t('navLogout')}</button>
          )}
        </div>
      )}
    </>
  );
}
