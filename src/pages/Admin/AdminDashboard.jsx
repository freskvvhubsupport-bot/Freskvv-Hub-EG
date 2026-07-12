// Admin Dashboard
import { useState, useEffect } from 'react';
import { collection, onSnapshot, query, where } from 'firebase/firestore';
import { db } from '../../firebase/config';
import { Users, CreditCard, RefreshCcw, ShoppingCart } from 'lucide-react';

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    users: 0,
    pendingDeposits: 0,
    pendingWithdraws: 0,
    totalOrders: 0
  });

  useEffect(() => {
    // Users count
    const unsubUsers = onSnapshot(collection(db, 'users'), snap => {
      setStats(prev => ({ ...prev, users: snap.size }));
    });

    // Pending Deposits
    const qDeposits = query(collection(db, 'wallet_requests'), where('type', '==', 'deposit'), where('status', '==', 'pending'));
    const unsubDeposits = onSnapshot(qDeposits, snap => {
      setStats(prev => ({ ...prev, pendingDeposits: snap.size }));
    });

    // Pending Withdraws / Refunds
    const qWithdraws = query(collection(db, 'wallet_requests'), where('type', '==', 'withdraw'), where('status', '==', 'pending'));
    const unsubWithdraws = onSnapshot(qWithdraws, snap => {
      setStats(prev => ({ ...prev, pendingWithdraws: snap.size }));
    });

    // Total Orders
    const unsubOrders = onSnapshot(collection(db, 'orders'), snap => {
      setStats(prev => ({ ...prev, totalOrders: snap.size }));
    });

    return () => {
      unsubUsers();
      unsubDeposits();
      unsubWithdraws();
      unsubOrders();
    };
  }, []);
  return (
    <div>
      <h1 className="admin-page-title">نظرة عامة</h1>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 'var(--space-4)' }}>
        <div className="admin-card" style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'rgba(79, 159, 255, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent-blue)' }}>
            <Users size={24} />
          </div>
          <div>
            <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-muted)' }}>إجمالي المستخدمين</div>
            <div style={{ fontSize: 'var(--font-size-3xl)', fontWeight: 800 }}>{stats.users}</div>
          </div>
        </div>
        
        <div className="admin-card" style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'rgba(234, 179, 8, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#eab308' }}>
            <CreditCard size={24} />
          </div>
          <div>
            <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-muted)' }}>إيداعات معلقة</div>
            <div style={{ fontSize: 'var(--font-size-3xl)', fontWeight: 800 }}>{stats.pendingDeposits}</div>
          </div>
        </div>
        
        <div className="admin-card" style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'rgba(239, 68, 68, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ef4444' }}>
            <RefreshCcw size={24} />
          </div>
          <div>
            <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-muted)' }}>سحوبات معلقة</div>
            <div style={{ fontSize: 'var(--font-size-3xl)', fontWeight: 800 }}>{stats.pendingWithdraws}</div>
          </div>
        </div>

        <div className="admin-card" style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'rgba(34, 197, 94, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#22c55e' }}>
            <ShoppingCart size={24} />
          </div>
          <div>
            <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-muted)' }}>إجمالي الطلبات</div>
            <div style={{ fontSize: 'var(--font-size-3xl)', fontWeight: 800 }}>{stats.totalOrders}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
