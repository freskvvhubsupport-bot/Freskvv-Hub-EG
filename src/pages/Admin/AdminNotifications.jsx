import { useState, useEffect } from 'react';
import { collection, query, orderBy, onSnapshot, addDoc, serverTimestamp, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../../firebase/config';
import { Bell, Send, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';

export default function AdminNotifications() {
  const [notifications, setNotifications] = useState([]);
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [isSending, setIsSending] = useState(false);

  useEffect(() => {
    const q = query(collection(db, 'global_notifications'), orderBy('createdAt', 'desc'));
    const unsub = onSnapshot(q, snap => {
      setNotifications(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });
    return unsub;
  }, []);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!title.trim() || !message.trim()) return;

    setIsSending(true);
    try {
      await addDoc(collection(db, 'global_notifications'), {
        title: title.trim(),
        message: message.trim(),
        createdAt: serverTimestamp()
      });
      setTitle('');
      setMessage('');
      toast.success('تم إرسال الإشعار لجميع المستخدمين');
    } catch (err) {
      toast.error('حدث خطأ أثناء الإرسال');
    } finally {
      setIsSending(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('هل أنت متأكد من حذف هذا الإشعار؟')) return;
    try {
      await deleteDoc(doc(db, 'global_notifications', id));
      toast.success('تم الحذف');
    } catch (err) {
      toast.error('حدث خطأ أثناء الحذف');
    }
  };

  return (
    <div>
      <div style={{ marginBottom: 'var(--space-6)' }}>
        <h1 className="admin-page-title">إرسال إشعارات عامة</h1>
        <p className="admin-page-desc">ستظهر هذه الإشعارات لجميع المستخدمين في لوحة التحكم الخاصة بهم</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-6)' }}>
        {/* Send Notification Form */}
        <div className="admin-card">
          <h2 style={{ marginBottom: 24, display: 'flex', alignItems: 'center', gap: 8 }}>
            <Send size={20} color="var(--accent-blue)" /> إشعار جديد
          </h2>
          <form onSubmit={handleSend}>
            <div className="form-group">
              <label>عنوان الإشعار</label>
              <input 
                type="text" 
                className="form-input"
                placeholder="مثال: تحديث هام في النظام"
                value={title}
                onChange={e => setTitle(e.target.value)}
                required
              />
            </div>
            <div className="form-group">
              <label>تفاصيل الإشعار</label>
              <textarea 
                className="form-input"
                placeholder="اكتب رسالتك هنا..."
                rows={5}
                value={message}
                onChange={e => setMessage(e.target.value)}
                required
              />
            </div>
            <button type="submit" className="btn-primary" disabled={isSending}>
              {isSending ? 'جاري الإرسال...' : 'إرسال الإشعار'}
            </button>
          </form>
        </div>

        {/* Previous Notifications */}
        <div className="admin-card">
          <h2 style={{ marginBottom: 24, display: 'flex', alignItems: 'center', gap: 8 }}>
            <Bell size={20} color="var(--accent-purple)" /> الإشعارات السابقة
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {notifications.length === 0 ? (
              <div style={{ color: 'var(--text-muted)', textAlign: 'center', padding: 32 }}>لا توجد إشعارات مرسلة</div>
            ) : (
              notifications.map(n => (
                <div key={n.id} style={{ background: 'rgba(255,255,255,0.02)', padding: 16, borderRadius: 8, border: '1px solid var(--border-glass)', position: 'relative' }}>
                  <button 
                    onClick={() => handleDelete(n.id)}
                    style={{ position: 'absolute', top: 16, left: 16, background: 'transparent', border: 'none', color: '#ef4444', cursor: 'pointer' }}
                  >
                    <Trash2 size={16} />
                  </button>
                  <h4 style={{ marginBottom: 8, color: 'var(--text-primary)', paddingLeft: 24 }}>{n.title}</h4>
                  <p style={{ color: 'var(--text-secondary)', fontSize: 14, whiteSpace: 'pre-wrap' }}>{n.message}</p>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 12 }}>
                    {n.createdAt?.toDate().toLocaleString('ar-EG')}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
