// Freskvv Tec EG — Admin Orders
import { useState, useEffect } from 'react';
import { collection, query, orderBy, onSnapshot, doc, updateDoc, getDoc, increment } from 'firebase/firestore';
import { db } from '../../firebase/config';
import { Package, Clock, CheckCircle2, XCircle, MoreVertical, Wallet } from 'lucide-react';
import toast from 'react-hot-toast';

export default function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);

  useEffect(() => {
    const q = query(collection(db, 'orders'), orderBy('createdAt', 'desc'));
    const unsub = onSnapshot(q, snap => {
      setOrders(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      setLoading(false);
    });
    return unsub;
  }, []);

  const updateOrderStatus = async (orderId, newStatus) => {
    try {
      await updateDoc(doc(db, 'orders', orderId), { status: newStatus });
      toast.success('تم تحديث حالة الطلب');
      setSelectedOrder(null);
    } catch (error) {
      toast.error('حدث خطأ');
    }
  };

  const cancelAndRefund = async (order) => {
    if (!window.confirm(`هل أنت متأكد من إلغاء الطلب واسترجاع ${order.price} ج.م إلى محفظة العميل؟`)) return;
    
    try {
      // 1. Update order status
      await updateDoc(doc(db, 'orders', order.id), { status: 'cancelled' });
      
      // 2. Refund wallet
      const userRef = doc(db, 'users', order.userId);
      await updateDoc(userRef, {
        walletBalance: increment(order.price)
      });

      toast.success('تم إلغاء الطلب واسترجاع المبلغ للعميل بنجاح');
      setSelectedOrder(null);
    } catch (error) {
      toast.error('حدث خطأ أثناء إلغاء الطلب');
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'pending': return <span style={{ background: 'rgba(245, 158, 11, 0.2)', color: '#f59e0b', padding: '4px 8px', borderRadius: 4, fontSize: 12 }}><Clock size={12} style={{display:'inline', marginBottom:-2, marginLeft:4}}/> قيد الانتظار</span>;
      case 'in-progress': return <span style={{ background: 'rgba(79, 159, 255, 0.2)', color: 'var(--accent-blue)', padding: '4px 8px', borderRadius: 4, fontSize: 12 }}>جاري التنفيذ</span>;
      case 'completed': return <span style={{ background: 'rgba(34, 197, 94, 0.2)', color: '#22c55e', padding: '4px 8px', borderRadius: 4, fontSize: 12 }}><CheckCircle2 size={12} style={{display:'inline', marginBottom:-2, marginLeft:4}}/> مكتمل</span>;
      case 'cancelled': return <span style={{ background: 'rgba(239, 68, 68, 0.2)', color: '#ef4444', padding: '4px 8px', borderRadius: 4, fontSize: 12 }}><XCircle size={12} style={{display:'inline', marginBottom:-2, marginLeft:4}}/> ملغي</span>;
      default: return null;
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-6)' }}>
        <div>
          <h1 className="admin-page-title">إدارة الطلبات</h1>
          <p className="admin-page-desc">متابعة وتحديث حالات طلبات الخدمات من العملاء</p>
        </div>
      </div>

      <div className="admin-card">
        {loading ? (
          <div style={{ padding: 'var(--space-4)', textAlign: 'center' }}>جاري التحميل...</div>
        ) : orders.length === 0 ? (
          <div style={{ padding: 'var(--space-4)', textAlign: 'center', color: 'var(--text-muted)' }}>لا توجد طلبات حتى الآن.</div>
        ) : (
          <table className="admin-table">
            <thead>
              <tr>
                <th>معرف الطلب</th>
                <th>الخدمة والباقة</th>
                <th>المشروع / الدومين</th>
                <th>السعر</th>
                <th>تاريخ الطلب</th>
                <th>الحالة</th>
                <th>الإجراءات</th>
              </tr>
            </thead>
            <tbody>
              {orders.map(order => (
                <tr key={order.id}>
                  <td style={{ fontFamily: 'monospace', fontSize: 12 }}>{order.id.slice(0, 8)}</td>
                  <td>
                    <div style={{ fontWeight: 600 }}>{order.serviceName}</div>
                    <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{order.packageName}</div>
                  </td>
                  <td>{order.projectName}</td>
                  <td style={{ fontWeight: 'bold', color: 'var(--accent-green-bright)' }}>{order.price} ج.م</td>
                  <td style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                    {order.createdAt?.toDate().toLocaleDateString('ar-EG')}
                  </td>
                  <td>{getStatusBadge(order.status)}</td>
                  <td>
                    <button className="btn-icon" onClick={() => setSelectedOrder(order)}>
                      <MoreVertical size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Action Modal */}
      {selectedOrder && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999 }}>
          <div style={{ background: 'var(--bg-secondary)', padding: 32, borderRadius: 16, width: '100%', maxWidth: 500, border: '1px solid var(--border-glass)' }}>
            <h3 style={{ marginBottom: 24 }}>تفاصيل الطلب: {selectedOrder.projectName}</h3>
            
            <div style={{ marginBottom: 16, background: 'rgba(255,255,255,0.02)', padding: 16, borderRadius: 8 }}>
              <p><strong>الخدمة:</strong> {selectedOrder.serviceName} - {selectedOrder.packageName}</p>
              <p><strong>المبلغ المدفوع:</strong> {selectedOrder.price} ج.م</p>
              <p><strong>ملاحظات العميل:</strong> {selectedOrder.notes || 'لا توجد'}</p>
            </div>

            <h4 style={{ marginBottom: 12 }}>تحديث الحالة:</h4>
            <div style={{ display: 'flex', gap: 8, marginBottom: 24, flexWrap: 'wrap' }}>
              <button onClick={() => updateOrderStatus(selectedOrder.id, 'in-progress')} className="btn-primary" style={{ background: 'var(--accent-blue)', flex: 1, justifyContent: 'center' }}>جاري التنفيذ</button>
              <button onClick={() => updateOrderStatus(selectedOrder.id, 'completed')} className="btn-primary" style={{ background: '#22c55e', flex: 1, justifyContent: 'center' }}>مكتمل</button>
            </div>

            <div style={{ borderTop: '1px solid var(--border-glass)', paddingTop: 16 }}>
              <button onClick={() => cancelAndRefund(selectedOrder)} style={{ width: '100%', background: 'transparent', border: '1px solid #ef4444', color: '#ef4444', padding: '10px', borderRadius: 8, cursor: 'pointer', fontWeight: 600 }}>
                إلغاء الطلب واسترجاع المبلغ للمحفظة
              </button>
            </div>

            <button onClick={() => setSelectedOrder(null)} style={{ marginTop: 16, width: '100%', background: 'rgba(255,255,255,0.1)', border: 'none', color: 'white', padding: 10, borderRadius: 8, cursor: 'pointer' }}>
              إغلاق
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
