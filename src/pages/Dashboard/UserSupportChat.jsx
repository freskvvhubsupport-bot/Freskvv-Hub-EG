// Freskvv Tec EG — User Support Chat
import { useState, useEffect, useRef } from 'react';
import {
  collection, query, orderBy, onSnapshot, addDoc,
  serverTimestamp, doc, onSnapshot as docSnapshot
} from 'firebase/firestore';
import { db } from '../../firebase/config';
import { useAuth } from '../../contexts/AuthContext';
import { Send, MessageSquare, CheckCircle2, XCircle, HeadphonesIcon, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';

export default function UserSupportChat() {
  const { currentUser, userProfile } = useAuth();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [sessionOpen, setSessionOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const bottomRef = useRef(null);

  // Listen to session state
  useEffect(() => {
    if (!currentUser) return;
    const unsub = onSnapshot(doc(db, 'users', currentUser.uid), snap => {
      setSessionOpen(snap.data()?.supportSessionOpen || false);
    });
    return unsub;
  }, [currentUser]);

  // Load messages
  useEffect(() => {
    if (!currentUser) return;
    const q = query(
      collection(db, 'support_chats', currentUser.uid, 'messages'),
      orderBy('createdAt', 'asc')
    );
    const unsub = onSnapshot(q, snap => {
      setMessages(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      setLoading(false);
    });
    return unsub;
  }, [currentUser]);

  // Auto scroll
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!input.trim() || !sessionOpen) return;
    const text = input.trim();
    setInput('');
    try {
      await addDoc(collection(db, 'support_chats', currentUser.uid, 'messages'), {
        sender: 'user',
        text,
        createdAt: serverTimestamp(),
      });
    } catch {
      toast.error('فشل إرسال الرسالة');
      setInput(text);
    }
  };

  return (
    <div style={{ paddingTop: 100, paddingBottom: 40, minHeight: '100vh' }}>
      <div className="container" style={{ maxWidth: 760 }}>
        {/* Header */}
        <div style={{ marginBottom: 24 }}>
          <Link to="/dashboard" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: 'var(--text-secondary)', textDecoration: 'none', marginBottom: 24, fontSize: 14, background: 'rgba(255,255,255,0.03)', padding: '6px 14px', borderRadius: 99, border: '1px solid var(--border-glass)' }}>
            <ArrowRight size={16} /> العودة للوحة التحكم
          </Link>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <div style={{ width: 48, height: 48, borderRadius: '50%', background: 'var(--gradient-main)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <HeadphonesIcon size={22} color="white" />
            </div>
            <div>
              <h1 style={{ fontSize: '1.6rem', fontWeight: 800, marginBottom: 2 }}>الدعم الفني</h1>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13 }}>
                {sessionOpen ? (
                  <><span style={{ width: 8, height: 8, borderRadius: '50%', background: '#22c55e', display: 'inline-block', boxShadow: '0 0 8px #22c55e' }} />
                  <span style={{ color: '#22c55e', fontWeight: 600 }}>فريق الدعم متصل الآن</span></>
                ) : (
                  <><span style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--text-muted)', display: 'inline-block' }} />
                  <span style={{ color: 'var(--text-muted)' }}>في انتظار الدعم الفني</span></>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Session Status Banner */}
        {!sessionOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            style={{ background: 'rgba(234,179,8,0.08)', border: '1px solid rgba(234,179,8,0.2)', borderRadius: 14, padding: '16px 20px', marginBottom: 20, display: 'flex', alignItems: 'center', gap: 12 }}
          >
            <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'rgba(234,179,8,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <HeadphonesIcon size={18} color="#eab308" />
            </div>
            <div>
              <div style={{ fontWeight: 700, fontSize: 14, color: '#eab308', marginBottom: 3 }}>لا توجد جلسة دعم مفتوحة حالياً</div>
              <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
                تواصل معنا عبر واتساب على{' '}
                <a href="https://wa.me/201221640301" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--accent-blue-bright)', fontWeight: 600 }}>
                  01221640301
                </a>
                {' '}وسيقوم فريق الدعم بفتح جلسة مخصصة لك وإرسال إشعار هنا.
              </div>
            </div>
          </motion.div>
        )}

        {/* Chat Box */}
        <div style={{ background: 'rgba(10,10,26,0.6)', border: '1px solid var(--border-glass)', borderRadius: 20, overflow: 'hidden', display: 'flex', flexDirection: 'column', height: 520 }}>
          {/* Messages */}
          <div style={{ flex: 1, overflowY: 'auto', padding: 20, display: 'flex', flexDirection: 'column', gap: 12 }}>
            {loading ? (
              <div style={{ textAlign: 'center', color: 'var(--text-muted)', padding: 40 }}>جاري التحميل...</div>
            ) : messages.length === 0 ? (
              <div style={{ textAlign: 'center', color: 'var(--text-muted)', padding: 60 }}>
                <MessageSquare size={48} style={{ opacity: 0.15, margin: '0 auto 16px' }} />
                <p>لا توجد رسائل بعد.</p>
                <p style={{ fontSize: 13, marginTop: 8 }}>بمجرد فتح الفريق للجلسة ستظهر الرسائل هنا.</p>
              </div>
            ) : messages.map((m, i) => {
              if (m.sender === 'system') return (
                <div key={m.id || i} style={{ textAlign: 'center', fontSize: 12, color: 'var(--text-muted)', background: 'rgba(255,255,255,0.04)', padding: '7px 16px', borderRadius: 20, margin: '4px auto', maxWidth: 380 }}>
                  {m.text}
                </div>
              );
              const isUser = m.sender === 'user';
              return (
                <motion.div
                  key={m.id || i}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  style={{ alignSelf: isUser ? 'flex-end' : 'flex-start', maxWidth: '72%' }}
                >
                  <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 4, textAlign: isUser ? 'left' : 'right' }}>
                    {isUser ? 'أنت' : '🎧 فريق الدعم'}
                  </div>
                  <div style={{
                    background: isUser ? 'var(--gradient-main)' : 'rgba(255,255,255,0.08)',
                    color: isUser ? 'white' : 'var(--text-primary)',
                    padding: '10px 16px',
                    borderRadius: 16,
                    borderBottomLeftRadius: isUser ? 16 : 4,
                    borderBottomRightRadius: isUser ? 4 : 16,
                    whiteSpace: 'pre-wrap',
                    lineHeight: 1.65,
                    fontSize: 14,
                  }}>
                    {m.text}
                  </div>
                  <div style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 4, textAlign: isUser ? 'left' : 'right' }}>
                    {m.createdAt?.toDate?.()?.toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' }) || ''}
                  </div>
                </motion.div>
              );
            })}
            <div ref={bottomRef} />
          </div>

          {/* Input */}
          <form onSubmit={sendMessage} style={{ padding: '14px 16px', borderTop: '1px solid var(--border-glass)', display: 'flex', gap: 10, background: 'rgba(255,255,255,0.02)' }}>
            <input
              type="text"
              className="form-input"
              placeholder={sessionOpen ? 'اكتب رسالتك لفريق الدعم...' : 'في انتظار فتح الجلسة من قِبل الفريق...'}
              value={input}
              onChange={e => setInput(e.target.value)}
              disabled={!sessionOpen}
              style={{ flex: 1, margin: 0 }}
            />
            <button
              type="submit"
              className="btn-primary"
              disabled={!sessionOpen || !input.trim()}
              style={{ padding: '0 18px', flexShrink: 0 }}
            >
              <Send size={18} />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
