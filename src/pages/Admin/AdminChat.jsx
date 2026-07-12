// Freskvv Tec EG — Admin Chat (v2 — with user notifications & open/close session)
import { useState, useEffect, useRef } from 'react';
import {
  collection, query, orderBy, onSnapshot, addDoc,
  serverTimestamp, doc, updateDoc, setDoc, getDoc
} from 'firebase/firestore';
import { db } from '../../firebase/config';
import { Send, User, MessageSquare, Clock, CheckCircle2, XCircle, Bell, Search } from 'lucide-react';
import toast from 'react-hot-toast';
import ConfirmModal from '../../components/UI/ConfirmModal';

export default function AdminChat() {
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [confirmClose, setConfirmClose] = useState(false);
  const bottomRef = useRef(null);

  // Load all users
  useEffect(() => {
    const unsub = onSnapshot(collection(db, 'users'), snap => {
      const data = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      // Sort: users with open support session first
      data.sort((a, b) => (b.supportSessionOpen ? 1 : 0) - (a.supportSessionOpen ? 1 : 0));
      setUsers(data);
      setLoadingUsers(false);
    });
    return unsub;
  }, []);

  // Load messages for selected user
  useEffect(() => {
    if (!selectedUser) return;
    setLoadingMessages(true);
    const q = query(
      collection(db, 'support_chats', selectedUser.id, 'messages'),
      orderBy('createdAt', 'asc')
    );
    const unsub = onSnapshot(q, snap => {
      setMessages(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      setLoadingMessages(false);
    });
    return unsub;
  }, [selectedUser]);

  // Auto scroll to bottom on new messages
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // ── Open a support session with user ────────────────────────────
  const openSupportSession = async (user) => {
    try {
      // 1. Mark the user as having an open support session
      await updateDoc(doc(db, 'users', user.id), {
        supportSessionOpen: true,
        supportSessionOpenedAt: serverTimestamp(),
      });

      // 2. Send a notification to the user
      await addDoc(collection(db, 'user_notifications', user.id, 'notifications'), {
        title: 'فريق الدعم الفني يريد التواصل معك 💬',
        message: 'قام فريق دعم Freskvv Tec بفتح محادثة خاصة معك. انقر هنا للدخول إلى الشات والتحدث مع الفريق مباشرةً.',
        link: '/dashboard/support',
        type: 'support',
        read: false,
        createdAt: serverTimestamp(),
      });

      // 3. Add a system message in the chat
      await addDoc(collection(db, 'support_chats', user.id, 'messages'), {
        sender: 'system',
        text: '🔔 تم فتح جلسة الدعم الفني. فريق Freskvv Tec متاح الآن للمساعدة.',
        createdAt: serverTimestamp(),
      });

      setSelectedUser({ ...user, supportSessionOpen: true });
      toast.success(`تم فتح جلسة الدعم مع ${user.fullName || user.email} وإرسال إشعار له`);
    } catch (err) {
      console.error(err);
      toast.error('حدث خطأ أثناء فتح الجلسة');
    }
  };

  // ── Close support session ───────────────────────────────────────
  const closeSupportSession = async () => {
    try {
      await updateDoc(doc(db, 'users', selectedUser.id), {
        supportSessionOpen: false,
        supportSessionClosedAt: serverTimestamp(),
      });

      // Notify user session is closed
      await addDoc(collection(db, 'user_notifications', selectedUser.id, 'notifications'), {
        title: 'تم إغلاق جلسة الدعم الفني',
        message: 'قام فريق الدعم بإغلاق المحادثة. إذا كنت بحاجة لمزيد من المساعدة، يمكنك التواصل معنا في أي وقت.',
        link: '/dashboard/support',
        type: 'support',
        read: false,
        createdAt: serverTimestamp(),
      });

      // System message in chat
      await addDoc(collection(db, 'support_chats', selectedUser.id, 'messages'), {
        sender: 'system',
        text: '✅ تم إغلاق جلسة الدعم الفني من قِبَل الفريق. شكراً لتواصلك معنا.',
        createdAt: serverTimestamp(),
      });

      setSelectedUser(p => ({ ...p, supportSessionOpen: false }));
      setConfirmClose(false);
      toast.success('تم إغلاق الجلسة وإرسال إشعار للمستخدم');
    } catch (err) {
      toast.error('حدث خطأ');
    }
  };

  // ── Send message ────────────────────────────────────────────────
  const sendMessage = async (e) => {
    e.preventDefault();
    if (!input.trim() || !selectedUser) return;
    const text = input.trim();
    setInput('');
    try {
      await addDoc(collection(db, 'support_chats', selectedUser.id, 'messages'), {
        sender: 'admin',
        text,
        createdAt: serverTimestamp(),
      });
      // Push notification for new message
      await addDoc(collection(db, 'user_notifications', selectedUser.id, 'notifications'), {
        title: 'رسالة جديدة من الدعم الفني 💬',
        message: text.length > 80 ? text.slice(0, 80) + '...' : text,
        link: '/dashboard/support',
        type: 'support_message',
        read: false,
        createdAt: serverTimestamp(),
      });
    } catch {
      toast.error('فشل إرسال الرسالة');
      setInput(text);
    }
  };

  const filteredUsers = users.filter(u =>
    !search || (u.fullName || u.email || '').toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div style={{ display: 'flex', height: 'calc(100vh - 120px)', background: 'rgba(10,10,26,0.5)', borderRadius: 'var(--radius-xl)', border: '1px solid var(--border-glass)', overflow: 'hidden' }}>

      {/* ── Users Sidebar ─────────────────────────────── */}
      <div style={{ width: 300, borderLeft: '1px solid var(--border-glass)', display: 'flex', flexDirection: 'column', flexShrink: 0 }}>
        <div style={{ padding: '16px', borderBottom: '1px solid var(--border-glass)' }}>
          <div style={{ fontWeight: 700, marginBottom: 10 }}>المستخدمون</div>
          <div style={{ position: 'relative' }}>
            <Search size={14} style={{ position: 'absolute', top: '50%', right: 10, transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input
              type="text"
              className="form-input"
              placeholder="بحث..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              style={{ paddingRight: 32, margin: 0, fontSize: 13 }}
            />
          </div>
        </div>

        <div style={{ overflowY: 'auto', flex: 1 }}>
          {loadingUsers ? (
            <div style={{ padding: 16, color: 'var(--text-muted)' }}>جاري التحميل...</div>
          ) : filteredUsers.map(u => (
            <div
              key={u.id}
              onClick={() => setSelectedUser(u)}
              style={{
                padding: '14px 16px',
                borderBottom: '1px solid rgba(255,255,255,0.04)',
                cursor: 'pointer',
                background: selectedUser?.id === u.id ? 'rgba(79,159,255,0.1)' : 'transparent',
                transition: '0.2s',
                display: 'flex',
                alignItems: 'center',
                gap: 10,
              }}
            >
              {/* Avatar */}
              <div style={{ width: 38, height: 38, borderRadius: '50%', background: 'var(--gradient-main)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 15, flexShrink: 0 }}>
                {(u.fullName || u.email || '?')[0].toUpperCase()}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: 600, fontSize: 13, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{u.fullName || u.email}</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 2 }}>
                  {u.supportSessionOpen ? (
                    <span style={{ fontSize: 11, color: '#22c55e', display: 'flex', alignItems: 'center', gap: 3 }}>
                      <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#22c55e', display: 'inline-block' }} />
                      جلسة مفتوحة
                    </span>
                  ) : (
                    <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>لا توجد جلسة</span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Chat Area ─────────────────────────────────── */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        {selectedUser ? (
          <>
            {/* Header */}
            <div style={{ padding: '14px 20px', borderBottom: '1px solid var(--border-glass)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(255,255,255,0.02)', gap: 12 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'var(--gradient-main)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 16 }}>
                  {(selectedUser.fullName || selectedUser.email || '?')[0].toUpperCase()}
                </div>
                <div>
                  <div style={{ fontWeight: 700 }}>{selectedUser.fullName || selectedUser.email}</div>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{selectedUser.email}</div>
                </div>
              </div>

              <div style={{ display: 'flex', gap: 8 }}>
                {!selectedUser.supportSessionOpen ? (
                  <button
                    onClick={() => openSupportSession(selectedUser)}
                    className="btn-primary"
                    style={{ padding: '8px 16px', fontSize: 13, display: 'flex', alignItems: 'center', gap: 6 }}
                  >
                    <Bell size={15} /> فتح جلسة + إشعار
                  </button>
                ) : (
                  <button
                    onClick={() => setConfirmClose(true)}
                    style={{ padding: '8px 16px', fontSize: 13, display: 'flex', alignItems: 'center', gap: 6, background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.3)', color: '#ef4444', borderRadius: 10, cursor: 'pointer', fontFamily: 'var(--font-primary)' }}
                  >
                    <XCircle size={15} /> إغلاق الجلسة
                  </button>
                )}
              </div>
            </div>

            {/* Session status banner */}
            {!selectedUser.supportSessionOpen && (
              <div style={{ background: 'rgba(239,68,68,0.08)', borderBottom: '1px solid rgba(239,68,68,0.15)', padding: '10px 20px', fontSize: 13, color: '#f87171', display: 'flex', alignItems: 'center', gap: 8 }}>
                <XCircle size={14} /> الجلسة مغلقة — اضغط "فتح جلسة + إشعار" لإرسال إشعار للمستخدم وبدء المحادثة
              </div>
            )}
            {selectedUser.supportSessionOpen && (
              <div style={{ background: 'rgba(34,197,94,0.08)', borderBottom: '1px solid rgba(34,197,94,0.15)', padding: '10px 20px', fontSize: 13, color: '#22c55e', display: 'flex', alignItems: 'center', gap: 8 }}>
                <CheckCircle2 size={14} /> الجلسة مفتوحة — المستخدم تلقّى إشعاراً بالتواصل
              </div>
            )}

            {/* Messages */}
            <div style={{ flex: 1, padding: 20, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 12 }}>
              {loadingMessages ? (
                <div style={{ color: 'var(--text-muted)' }}>جاري التحميل...</div>
              ) : messages.length === 0 ? (
                <div style={{ textAlign: 'center', color: 'var(--text-muted)', padding: 40 }}>
                  <MessageSquare size={40} style={{ opacity: 0.2, margin: '0 auto 12px' }} />
                  <p>لا توجد رسائل بعد.</p>
                  <p style={{ fontSize: 13, marginTop: 8 }}>افتح الجلسة لإرسال إشعار للمستخدم.</p>
                </div>
              ) : messages.map((m, i) => {
                if (m.sender === 'system') return (
                  <div key={m.id || i} style={{ textAlign: 'center', fontSize: 12, color: 'var(--text-muted)', background: 'rgba(255,255,255,0.03)', padding: '8px 16px', borderRadius: 20, margin: '4px auto', maxWidth: 400 }}>
                    {m.text}
                  </div>
                );
                const isAdmin = m.sender === 'admin';
                return (
                  <div key={m.id || i} style={{ alignSelf: isAdmin ? 'flex-end' : 'flex-start', maxWidth: '70%' }}>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 4, textAlign: isAdmin ? 'left' : 'right' }}>
                      {isAdmin ? 'أنت (الدعم الفني)' : (selectedUser.fullName || 'المستخدم')}
                    </div>
                    <div style={{
                      background: isAdmin ? 'var(--gradient-main)' : 'rgba(255,255,255,0.08)',
                      color: isAdmin ? 'white' : 'var(--text-primary)',
                      padding: '10px 16px',
                      borderRadius: 16,
                      borderBottomLeftRadius: isAdmin ? 16 : 4,
                      borderBottomRightRadius: isAdmin ? 4 : 16,
                      whiteSpace: 'pre-wrap',
                      lineHeight: 1.6,
                      fontSize: 14,
                    }}>
                      {m.text}
                    </div>
                  </div>
                );
              })}
              <div ref={bottomRef} />
            </div>

            {/* Input */}
            <form onSubmit={sendMessage} style={{ padding: '14px 20px', borderTop: '1px solid var(--border-glass)', display: 'flex', gap: 10, background: 'rgba(255,255,255,0.02)' }}>
              <input
                type="text"
                className="form-input"
                placeholder={selectedUser.supportSessionOpen ? 'اكتب رسالتك...' : 'افتح الجلسة أولاً'}
                value={input}
                onChange={e => setInput(e.target.value)}
                disabled={!selectedUser.supportSessionOpen}
                style={{ flex: 1, margin: 0 }}
              />
              <button type="submit" className="btn-primary" disabled={!selectedUser.supportSessionOpen || !input.trim()} style={{ padding: '0 18px' }}>
                <Send size={18} />
              </button>
            </form>
          </>
        ) : (
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>
            <MessageSquare size={56} style={{ opacity: 0.15, marginBottom: 16 }} />
            <p style={{ fontSize: 15 }}>اختر مستخدم من القائمة</p>
            <p style={{ fontSize: 13, marginTop: 8 }}>ثم افتح جلسة الدعم لإرسال إشعار له</p>
          </div>
        )}
      </div>

      {/* Confirm close modal */}
      <ConfirmModal
        isOpen={confirmClose}
        onConfirm={closeSupportSession}
        onCancel={() => setConfirmClose(false)}
        title="إغلاق جلسة الدعم"
        message="هل أنت متأكد من إغلاق جلسة الدعم مع هذا المستخدم؟ سيتلقى إشعاراً بأن الجلسة انتهت."
        confirmText="نعم، أغلق"
        cancelText="إلغاء"
      />
    </div>
  );
}
