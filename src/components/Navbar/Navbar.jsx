// Freskvv Tec EG — Navbar Component
import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Bell, Wallet, User, LogOut, Settings, LayoutDashboard, Menu, X, CheckCircle2, Globe } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useSettings } from '../../contexts/SettingsContext';
import { useTranslation } from 'react-i18next';
import './Navbar.css';

const NAV_LINKS_AR = [
  { label: 'الرئيسية', to: '/' },
  { label: 'خدماتنا', to: '/services' },
  { label: 'متجر الألعاب', to: '/game-store' },
  { label: 'خدمة مخصصة', to: '/custom-service' },
  { label: 'التعليم', to: '/learning' },
];

const NAV_LINKS_EN = [
  { label: 'Home', to: '/' },
  { label: 'Services', to: '/services' },
  { label: 'Game Store', to: '/game-store' },
  { label: 'Custom Request', to: '/custom-service' },
  { label: 'Learning', to: '/learning' },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [notifCount] = useState(3);
  const { currentUser, userProfile, isAdmin, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const dropdownRef = useRef(null);
  const { language, changeLanguage, toggleTheme, theme } = useSettings();
  const { i18n } = useTranslation();

  const isAr = language === 'ar';
  const navLinks = isAr ? NAV_LINKS_AR : NAV_LINKS_EN;

  // Sync i18next with SettingsContext language
  useEffect(() => {
    if (i18n.language !== language) {
      i18n.changeLanguage(language);
    }
  }, [language, i18n]);

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
              {navLinks.map((link) => (
                <li key={link.to}>
                  <Link
                    to={link.to}
                    className={`navbar-link ${location.pathname === link.to ? 'active' : ''}`}
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
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
                  title="تغيير اللغة"
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
                    title="المحفظة"
                  >
                    <Wallet size={16} />
                    <span>{userProfile?.walletBalance ?? 0} ج.م</span>
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
                      title={userProfile?.fullName || 'حسابي'}
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
                          لوحة التحكم
                        </Link>
                        <Link to="/dashboard/wallet" className="navbar-dropdown-item" onClick={() => setDropdownOpen(false)}>
                          <Wallet size={16} />
                          محفظتي
                        </Link>
                        <Link to="/dashboard/settings" className="navbar-dropdown-item" onClick={() => setDropdownOpen(false)}>
                          <Settings size={16} />
                          الإعدادات
                        </Link>

                        {isAdmin && (
                          <>
                            <div className="dropdown-divider" />
                            <Link to="/admin" className="navbar-dropdown-item" onClick={() => setDropdownOpen(false)}>
                              <LayoutDashboard size={16} />
                              لوحة الإدارة
                            </Link>
                          </>
                        )}

                        <div className="dropdown-divider" />
                        <button className="navbar-dropdown-item danger" onClick={handleLogout}>
                          <LogOut size={16} />
                          تسجيل الخروج
                        </button>
                      </div>
                    )}
                  </div>
                </>
              ) : (
                <>
                  <Link to="/auth/login" className="btn-ghost" style={{ padding: 'var(--space-2) var(--space-5)', fontSize: 'var(--font-size-sm)' }}>
                    تسجيل الدخول
                  </Link>
                  <Link to="/auth/register" className="btn-primary" style={{ padding: 'var(--space-2) var(--space-5)', fontSize: 'var(--font-size-sm)' }}>
                    إنشاء حساب
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
          {navLinks.map(link => (
            <Link key={link.to} to={link.to} className="mobile-nav-link">
              {link.label}
            </Link>
          ))}
          {!currentUser ? (
            <div style={{ display: 'flex', gap: 'var(--space-3)', marginTop: 'var(--space-4)' }}>
              <Link to="/auth/login" className="btn-ghost">تسجيل الدخول</Link>
              <Link to="/auth/register" className="btn-primary">إنشاء حساب</Link>
            </div>
          ) : (
            <button className="btn-ghost" onClick={handleLogout}>تسجيل الخروج</button>
          )}
        </div>
      )}
    </>
  );
}
