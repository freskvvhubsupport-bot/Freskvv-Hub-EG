// Freskvv Tec EG — Admin Layout
import { useState, useEffect } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { db } from '../../firebase/config';
import { LayoutDashboard, Users, Wallet, Layers, GamepadIcon, Wrench, MessageSquare, Bell, Package, Tag, Archive } from 'lucide-react';
import './Admin.css';

const ADMIN_NAV = [
  { label: 'الرئيسية', to: '/admin', icon: <LayoutDashboard size={18} />, exact: true },
  { label: 'المستخدمين', to: '/admin/users', icon: <Users size={18} /> },
  { label: 'المحفظة', to: '/admin/wallet', icon: <Wallet size={18} /> },
  { label: 'الأقسام', to: '/admin/sections', icon: <Layers size={18} /> },
  { label: 'متجر الألعاب', to: '/admin/game-store', icon: <GamepadIcon size={18} /> },
  { label: 'الطلبات', to: '/admin/orders', icon: <Package size={18} /> },
  { label: 'أكواد الخصم', to: '/admin/discount-codes', icon: <Tag size={18} /> },
  { label: 'شات الدعم', to: '/admin/support', icon: <MessageSquare size={18} /> },
  { label: 'الإشعارات', to: '/admin/notifications', icon: <Bell size={18} /> },
  { label: 'جارد (الأرشيف)', to: '/admin/archive', icon: <Archive size={18} /> },
  { label: 'الإعدادات', to: '/admin/settings', icon: <Wrench size={18} /> },
];

export default function AdminLayout() {
  const location = useLocation();
  const [pendingOrders, setPendingOrders] = useState(0);
  const [pendingDeposits, setPendingDeposits] = useState(0);
  const [pendingRefunds, setPendingRefunds] = useState(0);

  useEffect(() => {
    // Pending Orders
    const unsubOrders = onSnapshot(query(collection(db, 'orders'), where('status', '==', 'pending')), snap => {
      setPendingOrders(snap.docs.length);
    });
    // Pending Deposits
    const unsubDeposits = onSnapshot(query(collection(db, 'depositRequests'), where('status', '==', 'pending')), snap => {
      setPendingDeposits(snap.docs.length);
    });
    // Pending Refunds
    const unsubRefunds = onSnapshot(query(collection(db, 'refundRequests'), where('status', '==', 'pending')), snap => {
      setPendingRefunds(snap.docs.length);
    });

    return () => { unsubOrders(); unsubDeposits(); unsubRefunds(); };
  }, []);

  const getBadgeCount = (path) => {
    if (path === '/admin/orders') return pendingOrders;
    if (path === '/admin/wallet') return pendingDeposits + pendingRefunds;
    return 0;
  };

  return (
    <div className="admin-layout">
      {/* Sidebar */}
      <aside className="admin-sidebar">
        <div className="admin-sidebar-header">
          <div className="admin-logo">⚡ Admin</div>
        </div>
        <nav className="admin-nav">
            {ADMIN_NAV.map(nav => {
              const isActive = nav.exact ? location.pathname === nav.to : location.pathname.startsWith(nav.to);
              const badge = getBadgeCount(nav.to);
              return (
                <Link
                  key={nav.to}
                  to={nav.to}
                  className={`admin-nav-item ${isActive ? 'active' : ''}`}
                  style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                    {nav.icon}
                    {nav.label}
                  </div>
                  {badge > 0 && (
                    <span style={{ background: '#ef4444', color: 'white', fontSize: 11, fontWeight: 'bold', padding: '2px 6px', borderRadius: 10 }}>
                      {badge}
                    </span>
                  )}
                </Link>
              );
            })}
        </nav>
      </aside>

      {/* Main Content */}
      <main className="admin-main">
        <div className="admin-container">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
