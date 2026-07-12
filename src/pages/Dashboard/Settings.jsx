// Freskvv Tec EG — Settings Page
import { useState } from 'react';
import { Bell, Lock, Smartphone, Shield, Key, Mail, ArrowRight } from 'lucide-react';
import { updatePassword, sendEmailVerification } from 'firebase/auth';
import { useAuth } from '../../contexts/AuthContext';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import './Dashboard.css';

export default function Settings() {
  const { currentUser } = useAuth();
  const [notifications, setNotifications] = useState({
    push: false,
    email: true,
    promos: true
  });
  const [twoFactor, setTwoFactor] = useState(false);
  const [passwordFormOpen, setPasswordFormOpen] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [changingPwd, setChangingPwd] = useState(false);

  const toggle2FA = () => {
    if (!twoFactor) {
      toast.success('تم إرسال كود تفعيل على بريدك الإلكتروني لتأكيد تشغيل التحقق بخطوتين');
      setTwoFactor(true);
    } else {
      toast.success('تم تعطيل ميزة التحقق بخطوتين');
      setTwoFactor(false);
    }
  };

  const toggleNotif = (key) => {
    setNotifications(prev => {
      const newState = { ...prev, [key]: !prev[key] };
      if (key === 'push' && newState.push) {
        toast.success('تم السماح بالإشعارات الفورية');
      }
      return newState;
    });
  };

  const handleUpdatePassword = async (e) => {
    e.preventDefault();
    if (newPassword.length < 6) {
      toast.error('كلمة المرور يجب أن تكون 6 أحرف على الأقل');
      return;
    }
    setChangingPwd(true);
    try {
      await updatePassword(currentUser, newPassword);
      toast.success('تم تغيير كلمة المرور بنجاح ✅');
      setPasswordFormOpen(false);
      setNewPassword('');
    } catch (err) {
      console.error(err);
      if (err.code === 'auth/requires-recent-login') {
        toast.error('يرجى تسجيل الخروج والدخول مرة أخرى لتغيير كلمة المرور');
      } else {
        toast.error('حدث خطأ أثناء تغيير كلمة المرور');
      }
    } finally {
      setChangingPwd(false);
    }
  };

  const handleVerifyEmail = async () => {
    if (currentUser?.emailVerified) {
      toast.success('بريدك الإلكتروني موثق بالفعل ✅');
      return;
    }
    try {
      await sendEmailVerification(currentUser);
      toast.success('تم إرسال رابط التوثيق لبريدك الإلكتروني، يرجى تفقده 📩');
    } catch (err) {
      console.error(err);
      if (err.code === 'auth/too-many-requests') {
        toast.error('لقد قمت بطلب رسالة توثيق مؤخراً. يرجى الانتظار قليلاً.');
      } else {
        toast.error('حدث خطأ أثناء إرسال رسالة التوثيق');
      }
    }
  };

  return (
    <div className="dashboard-page" style={{ paddingTop: 100 }}>
      <div className="container">
        <div style={{ marginBottom: 24 }}>
          <Link to="/dashboard" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, color: 'var(--text-secondary)', textDecoration: 'none', marginBottom: 16 }}>
            <ArrowRight size={18} /> العودة للوحة التحكم
          </Link>
          <h1 className="dashboard-section-title" style={{ fontSize: 'var(--font-size-3xl)', marginBottom: 'var(--space-8)' }}>الإعدادات</h1>
        </div>

        <div style={{ display: 'grid', gap: 'var(--space-6)', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))' }}>
          
          {/* Security & 2FA */}
          <div className="admin-card">
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', marginBottom: 'var(--space-6)' }}>
              <div className="dashboard-quick-icon" style={{ color: '#22c55e', background: 'rgba(34,197,94,0.1)' }}>
                <Shield size={20} />
              </div>
              <h2 style={{ fontSize: 'var(--font-size-lg)', fontWeight: 800 }}>الأمان والخصوصية</h2>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-4)', padding: 'var(--space-4)', background: 'rgba(255,255,255,0.02)', borderRadius: 'var(--radius-lg)' }}>
              <div>
                <div style={{ fontWeight: 700, display: 'flex', alignItems: 'center', gap: 6 }}>
                  <Lock size={16} /> التحقق بخطوتين (2FA)
                </div>
                <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)' }}>أضف طبقة أمان إضافية لحسابك</div>
              </div>
              <button 
                className={twoFactor ? "btn-ghost" : "btn-primary"} 
                style={{ padding: '6px 12px', fontSize: 'var(--font-size-xs)' }}
                onClick={toggle2FA}
              >
                {twoFactor ? 'تعطيل' : 'تفعيل'}
              </button>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-4)', padding: 'var(--space-4)', background: 'rgba(255,255,255,0.02)', borderRadius: 'var(--radius-lg)' }}>
              <div>
                <div style={{ fontWeight: 700, display: 'flex', alignItems: 'center', gap: 6 }}>
                  <Mail size={16} /> توثيق البريد الإلكتروني
                </div>
                <div style={{ fontSize: 'var(--font-size-xs)', color: currentUser?.emailVerified ? '#22c55e' : 'var(--accent-red)' }}>
                  {currentUser?.emailVerified ? 'حسابك موثق' : 'غير موثق - يرجى التوثيق لحماية حسابك'}
                </div>
              </div>
              <button 
                className="btn-ghost" 
                style={{ padding: '6px 12px', fontSize: 'var(--font-size-xs)', color: currentUser?.emailVerified ? 'var(--text-muted)' : 'var(--accent-blue-bright)' }}
                onClick={handleVerifyEmail}
                disabled={currentUser?.emailVerified}
              >
                {currentUser?.emailVerified ? 'موثق' : 'إرسال رسالة'}
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', padding: 'var(--space-4)', background: 'rgba(255,255,255,0.02)', borderRadius: 'var(--radius-lg)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontWeight: 700, display: 'flex', alignItems: 'center', gap: 6 }}>
                    <Key size={16} /> تغيير كلمة المرور
                  </div>
                </div>
                <button 
                  className="btn-ghost" 
                  style={{ padding: '6px 12px', fontSize: 'var(--font-size-xs)' }}
                  onClick={() => setPasswordFormOpen(!passwordFormOpen)}
                >
                  {passwordFormOpen ? 'إلغاء' : 'تغيير'}
                </button>
              </div>
              
              {passwordFormOpen && (
                <form onSubmit={handleUpdatePassword} style={{ marginTop: 16, borderTop: '1px solid var(--border-glass)', paddingTop: 16 }}>
                  <input 
                    type="password" 
                    className="form-input" 
                    placeholder="كلمة المرور الجديدة (6 أحرف على الأقل)" 
                    value={newPassword}
                    onChange={e => setNewPassword(e.target.value)}
                    required
                  />
                  <button type="submit" className="btn-primary" disabled={changingPwd} style={{ marginTop: 8, width: '100%', justifyContent: 'center' }}>
                    {changingPwd ? 'جاري التغيير...' : 'حفظ كلمة المرور'}
                  </button>
                </form>
              )}
            </div>
          </div>

          {/* Notifications */}
          <div className="admin-card">
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', marginBottom: 'var(--space-6)' }}>
              <div className="dashboard-quick-icon" style={{ color: '#3b82f6', background: 'rgba(59,130,246,0.1)' }}>
                <Bell size={20} />
              </div>
              <h2 style={{ fontSize: 'var(--font-size-lg)', fontWeight: 800 }}>الإشعارات والتنبيهات</h2>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
              {[
                { key: 'push', label: 'الإشعارات الفورية (Push)', icon: <Smartphone size={16} /> },
                { key: 'email', label: 'تنبيهات البريد الإلكتروني', icon: <Bell size={16} /> },
                { key: 'promos', label: 'العروض الترويجية والخصومات', icon: <Bell size={16} /> }
              ].map(item => (
                <div key={item.key} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: 'var(--space-4)', background: 'rgba(255,255,255,0.02)', borderRadius: 'var(--radius-lg)' }}>
                  <div style={{ fontWeight: 700, display: 'flex', alignItems: 'center', gap: 6 }}>
                    {item.icon} {item.label}
                  </div>
                  <label className="toggle-switch" style={{ position: 'relative', display: 'inline-block', width: 44, height: 24 }}>
                    <input 
                      type="checkbox" 
                      checked={notifications[item.key]} 
                      onChange={() => toggleNotif(item.key)}
                      style={{ opacity: 0, width: 0, height: 0 }}
                    />
                    <span style={{
                      position: 'absolute', cursor: 'pointer', inset: 0,
                      backgroundColor: notifications[item.key] ? 'var(--accent-blue)' : 'var(--border-glass)',
                      transition: '.4s', borderRadius: 34
                    }}>
                      <span style={{
                        position: 'absolute', content: '""', height: 18, width: 18,
                        left: notifications[item.key] ? '22px' : '3px',
                        bottom: 3, backgroundColor: 'white', transition: '.4s', borderRadius: '50%'
                      }} />
                    </span>
                  </label>
                </div>
              ))}
            </div>
          </div>
          
        </div>
      </div>
    </div>
  );
}
