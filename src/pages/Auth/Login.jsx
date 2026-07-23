// Freskvv Tec EG — Login Page
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react';
import { sendPasswordResetEmail } from 'firebase/auth';
import { auth } from '../../firebase/config';
import toast from 'react-hot-toast';
import { useAuth } from '../../contexts/AuthContext';
import './Auth.css';

export default function Login() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [forgotOpen, setForgotOpen] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotLoading, setForgotLoading] = useState(false);
  const [forgotDone, setForgotDone] = useState(false);
  const { login, loginWithGoogle, createUserDocument } = useAuth();
  const navigate = useNavigate();

  const handleChange = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(form.email, form.password);
      toast.success('مرحباً بك! 👋');
      navigate('/dashboard');
    } catch (err) {
      const msgs = {
        'auth/user-not-found': 'البريد الإلكتروني غير مسجل',
        'auth/wrong-password': 'كلمة المرور غير صحيحة',
        'auth/invalid-credential': 'بيانات تسجيل الدخول غير صحيحة',
        'auth/too-many-requests': 'تم تجاوز عدد المحاولات، حاول لاحقاً',
        'auth/invalid-email': 'بريد إلكتروني غير صالح',
      };
      setError(msgs[err.code] || 'حدث خطأ، حاول مرة أخرى');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await loginWithGoogle();
      // Ensure user document exists in firestore
      await createUserDocument(res.user.uid, { fullName: res.user.displayName || 'مستخدم جوجل', email: res.user.email });
      toast.success('مرحباً بك! 👋');
      navigate('/dashboard');
    } catch (err) {
      console.error("Google Auth Error:", err);
      const googleMsgs = {
        'auth/popup-closed-by-user': 'تم إغلاق نافذة تسجيل الدخول',
        'auth/cancelled-popup-request': 'تم إلغاء طلب تسجيل الدخول',
        'auth/popup-blocked': 'المتصفح يمنع النوافذ المنبثقة، يرجى السماح بها',
        'auth/account-exists-with-different-credential': 'هذا البريد مسجل بطريقة أخرى، جرّب تسجيل الدخول بالبريد وكلمة المرور',
        'auth/unauthorized-domain': 'هذا النطاق غير مصرح له بتسجيل الدخول عبر جوجل. تواصل مع الدعم الفني.',
        'auth/internal-error': 'خطأ داخلي في الخادم، حاول مرة أخرى',
        'auth/network-request-failed': 'مشكلة في الاتصال بالإنترنت، تحقق من اتصالك',
      };
      setError(googleMsgs[err.code] || 'فشل تسجيل الدخول بجوجل. تأكد أنك تستخدم حساب جوجل صالح وحاول مرة أخرى.');
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!forgotEmail.trim()) { toast.error('يرجى إدخال بريدك الإلكتروني'); return; }
    setForgotLoading(true);
    try {
      await sendPasswordResetEmail(auth, forgotEmail.trim());
      setForgotDone(true);
      toast.success('تم إرسال رابط إعادة التعيين لبريدك الإلكتروني 📩');
    } catch (err) {
      const msgs = {
        'auth/user-not-found': 'هذا البريد الإلكتروني غير مسجل',
        'auth/invalid-email': 'بريد إلكتروني غير صالح',
        'auth/too-many-requests': 'تجاوزت الحد المسموح، حاول لاحقاً',
      };
      toast.error(msgs[err.code] || 'حدث خطأ، حاول مرة أخرى');
    } finally {
      setForgotLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-orb-1" />
      <div className="auth-orb-2" />

      <div className="auth-card">
        <Link to="/" className="auth-logo">
          <div className="auth-logo-icon">⚡</div>
          <span className="auth-logo-text">Freskvv Tec EG</span>
        </Link>

        <h1 className="auth-title">مرحباً بعودتك</h1>
        <p className="auth-subtitle">سجّل دخولك للوصول لحسابك</p>

        {/* Google */}
        <button className="btn-google" onClick={handleGoogle} disabled={loading}>
          <svg className="google-icon" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
          </svg>
          المتابعة عبر Google
        </button>

        <div className="auth-divider">
          <span>أو بالبريد الإلكتروني</span>
        </div>

        {error && <div className="auth-error">{error}</div>}

        <form className="auth-form" onSubmit={handleLogin}>
          <div className="form-group">
            <label className="form-label">البريد الإلكتروني</label>
            <input
              id="login-email"
              className="form-input"
              type="email"
              name="email"
              placeholder="example@email.com"
              value={form.email}
              onChange={handleChange}
              required
              dir="ltr"
            />
          </div>

          <div className="form-group">
            <label className="form-label">كلمة المرور</label>
            <div className="password-wrapper">
              <input
                id="login-password"
                className="form-input"
                type={showPass ? 'text' : 'password'}
                name="password"
                placeholder="••••••••"
                value={form.password}
                onChange={handleChange}
                required
                dir="ltr"
                style={{ paddingLeft: '48px' }}
              />
              <button type="button" className="password-toggle" onClick={() => setShowPass(v => !v)}>
                {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <div style={{ textAlign: 'left', marginBottom: 8 }}>
            <button
              type="button"
              onClick={() => { setForgotOpen(true); setForgotDone(false); setForgotEmail(form.email); }}
              style={{ background: 'none', border: 'none', color: 'var(--accent-blue-bright)', cursor: 'pointer', fontSize: 'var(--font-size-sm)', fontFamily: 'var(--font-primary)', fontWeight: 600, padding: 0 }}
            >
              نسيت كلمة المرور؟
            </button>
          </div>

          <button id="login-submit" className="btn-primary btn-auth" type="submit" disabled={loading}>
            {loading ? <><div className="spinner" /> جاري الدخول...</> : 'تسجيل الدخول'}
          </button>
        </form>

        <p className="auth-footer">
          مش عندك حساب؟ <Link to="/auth/register">إنشاء حساب مجاني</Link>
        </p>
      </div>

      {/* Forgot Password Modal */}
      {forgotOpen && (
        <div className="modal-overlay" onClick={() => setForgotOpen(false)}>
          <div className="modal-card" onClick={e => e.stopPropagation()}>
            {forgotDone ? (
              <div style={{ textAlign: 'center', padding: '8px 0' }}>
                <div style={{ fontSize: 56, marginBottom: 16 }}>📩</div>
                <h3 className="modal-title">تم الإرسال!</h3>
                <p style={{ color: 'var(--text-secondary)', lineHeight: 1.7, marginBottom: 24 }}>
                  تم إرسال رابط إعادة تعيين كلمة المرور إلى <strong style={{ color: 'var(--accent-blue-bright)' }}>{forgotEmail}</strong>
                  <br />افتح بريدك واتبع التعليمات.
                </p>
                <button className="btn-primary" onClick={() => setForgotOpen(false)} style={{ width: '100%', justifyContent: 'center' }}>موافق</button>
              </div>
            ) : (
              <>
                <h3 className="modal-title">🔑 نسيت كلمة المرور؟</h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: 14, marginBottom: 20, lineHeight: 1.7 }}>
                  أدخل بريدك الإلكتروني وسنرسل لك رابطاً لإعادة تعيين كلمة المرور
                </p>
                <div className="form-group" style={{ marginBottom: 20 }}>
                  <label className="form-label">البريد الإلكتروني</label>
                  <input
                    className="form-input"
                    type="email"
                    placeholder="example@email.com"
                    value={forgotEmail}
                    onChange={e => setForgotEmail(e.target.value)}
                    dir="ltr"
                    onKeyDown={e => e.key === 'Enter' && handleForgotPassword()}
                  />
                </div>
                <div style={{ display: 'flex', gap: 12 }}>
                  <button className="btn-ghost" onClick={() => setForgotOpen(false)} style={{ flex: 1, justifyContent: 'center' }}>إلغاء</button>
                  <button className="btn-primary" onClick={handleForgotPassword} disabled={forgotLoading} style={{ flex: 2, justifyContent: 'center' }}>
                    {forgotLoading ? <><div className="spinner" /> جاري الإرسال...</> : 'إرسال رابط التعيين'}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
