// Freskvv Tec EG — Admin Layout
import { useState, useEffect } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { db } from '../../firebase/config';
import { useAuth } from '../../contexts/AuthContext';
import { 
  LayoutDashboard, Users, Wallet, Layers, GamepadIcon, Wrench, 
  MessageSquare, Bell, Package, Tag, Archive, ExternalLink, Menu, X, ShieldCheck 
} from 'lucide-react';
import { isFeatureNew } from '../../utils/newBadge';
import './Admin.css';

const ADMIN_NAV = [
  { label: 'الرئيسية (نظرة عامة)', to: '/admin', icon: <LayoutDashboard size={18} />, exact: true },
  { label: 'المستخدمين', to: '/admin/users', icon: <Users size={18} /> },
  { label: 'المحفظة والإيداعات', to: '/admin/wallet', icon: <Wallet size={18} /> },
  { label: 'أقسام الخدمات', to: '/admin/sections', icon: <Layers size={18} /> },
  { label: 'متجر الألعاب', to: '/admin/game-store', icon: <GamepadIcon size={18} /> },
  { label: 'الطلبات', to: '/admin/orders', icon: <Package size={18} /> },
  { label: 'أكواد الخصم', to: '/admin/discount-codes', icon: <Tag size={18} /> },
  { label: 'شات الدعم الفني', to: '/admin/support', icon: <MessageSquare size={18} /> },
  { label: 'الإشعارات العامة', to: '/admin/notifications', icon: <Bell size={18} /> },
  { label: 'الأرشيف والتقارير', to: '/admin/archive', icon: <Archive size={18} /> },
  { label: 'إعدادات المنصة', to: '/admin/settings', icon: <Wrench size={18} /> },
];

export default function AdminLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const { currentUser, userProfile } = useAuth();
  const [pendingOrders, setPendingOrders] = useState(0);
  const [pendingDeposits, setPendingDeposits] = useState(0);
  const [pendingRefunds, setPendingRefunds] = useState(0);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  useEffect(() => {
    const unsubOrders = onSnapshot(query(collection(db, 'orders'), where('status', '==', 'pending')), snap => {
      setPendingOrders(snap.docs.length);
    });
    const unsubDeposits = onSnapshot(query(collection(db, 'depositRequests'), where('status', '==', 'pending')), snap => {
      setPendingDeposits(snap.docs.length);
    });
    const unsubRefunds = onSnapshot(query(collection(db, 'refundRequests'), where('status', '==', 'pending')), snap => {
      setPendingRefunds(snap.docs.length);
    });
    return () => { unsubOrders(); unsubDeposits(); unsubRefunds(); };
  }, []);

  useEffect(() => {
    setMobileSidebarOpen(false);
  }, [location.pathname]);

  const getBadgeCount = (path) => {
    if (path === '/admin/orders') return pendingOrders;
    if (path === '/admin/wallet') return pendingDeposits + pendingRefunds;
    return 0;
  };

  return (
    <div className="admin-root">
      {/* Dedicated Admin Header */}
      <header className="admin-header">
        <div className="admin-header-right">
          <button className="admin-mobile-toggle" onClick={() => setMobileSidebarOpen(v => !v)}>
            {mobileSidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
          <Link to="/admin" className="admin-brand">
            <span className="admin-brand-icon">⚡</span>
            <span className="admin-brand-title">Freskvv Admin</span>
            <span className="admin-role-badge">
              <ShieldCheck size={12} /> لوحة التحكم
            </span>
          </Link>
        </div>

        <div className="admin-header-left">
          <Link to="/" className="admin-header-btn main-site-btn">
            <ExternalLink size={15} />
            <span>العودة للموقع الرئيسي</span>
          </Link>

          <div className="admin-user-pill">
            <div className="admin-avatar">
              {userProfile?.fullName?.[0]?.toUpperCase() || 'A'}
            </div>
            <div className="admin-user-details">
              <span className="admin-user-name">{userProfile?.fullName || 'الأدمن'}</span>
              <span className="admin-user-role">Super Admin</span>
            </div>
          </div>
        </div>
      </header>

      <div className="admin-layout">
        {/* Sidebar */}
        <aside className={`admin-sidebar ${mobileSidebarOpen ? 'open' : ''}`}>
          <div className="admin-sidebar-title">قائمة الإدارة والتصنيفات</div>
          <nav className="admin-nav">
            {ADMIN_NAV.map(nav => {
              const isActive = nav.exact ? location.pathname === nav.to : location.pathname.startsWith(nav.to);
              const badge = getBadgeCount(nav.to);
              const hasNew = isFeatureNew(nav.to);
              return (
                <Link
                  key={nav.to}
                  to={nav.to}
                  className={`admin-nav-item ${isActive ? 'active' : ''}`}
                >
                  <div className="admin-nav-item-inner">
                    {nav.icon}
                    <span>{nav.label}</span>
                    {hasNew && (
                      <span className="new-badge" style={{ fontSize: '9px', padding: '1px 5px' }}>
                        جديد ✨
                      </span>
                    )}
                  </div>
                  {badge > 0 && (
                    <span className="admin-nav-badge">
                      {badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>
        </aside>

        {/* Overlay for mobile sidebar */}
        {mobileSidebarOpen && (
          <div className="admin-sidebar-overlay" onClick={() => setMobileSidebarOpen(false)} />
        )}

        {/* Main Content Area */}
        <main className="admin-main">
          <div className="admin-container">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
