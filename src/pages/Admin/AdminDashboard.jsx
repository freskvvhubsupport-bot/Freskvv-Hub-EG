// Freskvv Tec EG — Admin Dashboard Overview
import { useState, useEffect } from 'react';
import { collection, onSnapshot, query, where } from 'firebase/firestore';
import { db } from '../../firebase/config';
import { Users, CreditCard, RefreshCcw, ShoppingCart, ArrowUpRight, ShieldCheck, Sparkles, Layers, Tag, Bell, MessageSquare, GamepadIcon } from 'lucide-react';
import { Link } from 'react-router-dom';
import './Admin.css';

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    users: 0,
    pendingDeposits: 0,
    pendingWithdraws: 0,
    totalOrders: 0,
    pendingOrders: 0,
    sections: 0,
  });

  useEffect(() => {
    // Users count
    const unsubUsers = onSnapshot(collection(db, 'users'), snap => {
      setStats(prev => ({ ...prev, users: snap.size }));
    });

    // Pending Deposits
    const qDeposits = query(collection(db, 'depositRequests'), where('status', '==', 'pending'));
    const unsubDeposits = onSnapshot(qDeposits, snap => {
      setStats(prev => ({ ...prev, pendingDeposits: snap.size }));
    });

    // Pending Refunds
    const qWithdraws = query(collection(db, 'refundRequests'), where('status', '==', 'pending'));
    const unsubWithdraws = onSnapshot(qWithdraws, snap => {
      setStats(prev => ({ ...prev, pendingWithdraws: snap.size }));
    });

    // Orders
    const unsubOrders = onSnapshot(collection(db, 'orders'), snap => {
      const pendingCount = snap.docs.filter(d => d.data().status === 'pending').length;
      setStats(prev => ({ ...prev, totalOrders: snap.size, pendingOrders: pendingCount }));
    });

    // Sections
    const unsubSections = onSnapshot(collection(db, 'sections'), snap => {
      setStats(prev => ({ ...prev, sections: snap.size }));
    });

    return () => {
      unsubUsers();
      unsubDeposits();
      unsubWithdraws();
      unsubOrders();
      unsubSections();
    };
  }, []);

  const QUICK_ACTIONS = [
    { title: 'طلبات المحفظة والإيداع', desc: `${stats.pendingDeposits} طلبات تنتظر المراجعة`, to: '/admin/wallet', icon: <CreditCard size={22} color="#4f9fff" />, badge: stats.pendingDeposits },
    { title: 'متابعة طلبات العملاء', desc: `${stats.pendingOrders} طلبات قيد التنفيذ`, to: '/admin/orders', icon: <ShoppingCart size={22} color="#a855f7" />, badge: stats.pendingOrders },
    { title: 'إدارة ألعاب المتجر', desc: 'تعديل أسعار الشحن والأكواد', to: '/admin/game-store', icon: <GamepadIcon size={22} color="#22c55e" /> },
    { title: 'إرسال إشعار عام', desc: 'تنبيه كافة مستخدمي المنصة', to: '/admin/notifications', icon: <Bell size={22} color="#f59e0b" /> },
    { title: 'إنشاء كود خصم جديد', desc: 'تنشيط العروض والتخفيضات', to: '/admin/discount-codes', icon: <Tag size={22} color="#ec4899" /> },
    { title: 'شات الدعم الفني', desc: 'التواصل المباشر مع العملاء', to: '/admin/support', icon: <MessageSquare size={22} color="#06b6d4" /> },
  ];

  return (
    <div className="admin-dashboard-page">
      {/* Welcome Hero Banner */}
      <div className="admin-hero-banner">
        <div className="admin-hero-text">
          <div className="admin-hero-badge">
            <ShieldCheck size={14} /> مرحباً بك في لوحة الإدارة العليا
          </div>
          <h1>متابعة النشاط والعمليات <span className="gradient-text">لحظة بلحظة</span></h1>
          <p>تابع كل الإيداعات، الطلبات، والمستخدمين الجدد من مكان واحد بسهولة وأمان.</p>
        </div>
        <div className="admin-hero-status">
          <div className="status-indicator">
            <span className="dot pulse" />
            <span>حالة النظام: متصل ونشط ⚡</span>
          </div>
        </div>
      </div>

      {/* Primary Stats Grid */}
      <div className="admin-stats-grid">
        {/* Users */}
        <div className="stat-card blue">
          <div className="stat-icon">
            <Users size={24} />
          </div>
          <div className="stat-info">
            <div className="stat-label">إجمالي المستخدمين المسجلين</div>
            <div className="stat-value">{stats.users}</div>
          </div>
          <div className="stat-trend positive">
            <ArrowUpRight size={14} /> متفاعل
          </div>
        </div>

        {/* Pending Deposits */}
        <div className="stat-card warning">
          <div className="stat-icon">
            <CreditCard size={24} />
          </div>
          <div className="stat-info">
            <div className="stat-label">إيداعات تنتظر موافقتك</div>
            <div className="stat-value">{stats.pendingDeposits}</div>
          </div>
          {stats.pendingDeposits > 0 && (
            <Link to="/admin/wallet" className="stat-action-btn">
              مراجعة الآن
            </Link>
          )}
        </div>

        {/* Pending Refunds */}
        <div className="stat-card danger">
          <div className="stat-icon">
            <RefreshCcw size={24} />
          </div>
          <div className="stat-info">
            <div className="stat-label">سحوبات ومعاملات معلقة</div>
            <div className="stat-value">{stats.pendingWithdraws}</div>
          </div>
        </div>

        {/* Total Orders */}
        <div className="stat-card success">
          <div className="stat-icon">
            <ShoppingCart size={24} />
          </div>
          <div className="stat-info">
            <div className="stat-label">إجمالي الطلبات بالمنصة</div>
            <div className="stat-value">{stats.totalOrders}</div>
          </div>
          <div className="stat-trend">
            <span>{stats.pendingOrders} قيد الانتظار</span>
          </div>
        </div>
      </div>

      {/* Quick Action Navigation Grid */}
      <div className="admin-section-header">
        <h2>⚡ الوصول السريع للعمليات</h2>
        <p>إنتقل فوراً لأهم الأقسام والخدمات التي تتطلب اتخاذ إجراءات</p>
      </div>

      <div className="quick-actions-grid">
        {QUICK_ACTIONS.map(action => (
          <Link key={action.title} to={action.to} className="quick-action-card">
            <div className="quick-action-icon">
              {action.icon}
            </div>
            <div className="quick-action-content">
              <div className="quick-action-title">
                {action.title}
                {action.badge > 0 && (
                  <span className="quick-action-badge">{action.badge}</span>
                )}
              </div>
              <div className="quick-action-desc">{action.desc}</div>
            </div>
            <div className="quick-action-arrow">
              ←
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
