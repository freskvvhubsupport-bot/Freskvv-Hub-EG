// Freskvv Tec EG — Register Page
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Mail, Lock, CheckCircle2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../../contexts/AuthContext';
import './Auth.css';

export default function Register() {
  const [step, setStep] = useState(1); // 1: creds, 2: verify email
  const [form, setForm] = useState({ email: '', password: '', confirmPassword: '' });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { register, loginWithGoogle, sendVerificationEmail, createUserDocument, currentUser } = useAuth();
  const navigate = useNavigate();

  const handleChange = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');
    if (form.password !== form.confirmPassword) {
      setError('كلمتا المرور غير متطابقتين');
      return;
    }
    if (form.password.length < 8) {
      setError('كلمة المرور يجب أن تكون 8 أحرف على الأقل');
      return;
    }
    setLoading(true);
    try {
      const cred = await register(form.email, form.password);
      await sendVerificationEmail();
      await createUserDocument(cred.user.uid, {
        email: form.email,
        profileComplete: false,
      });
      setStep(2);
    } catch (err) {
      const msgs = {
        'auth/email-already-in-use': 'البريد الإلكتروني مستخدم بالفعل',
        'auth/invalid-email': 'بريد إلكتروني غير صالح',
        'auth/weak-password': 'كلمة المرور ضعيفة جداً',
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
      await createUserDocument(res.user.uid, { fullName: res.user.displayName || 'مستخدم جوجل', email: res.user.email });
      toast.success('مرحباً بك! 👋');
      navigate('/dashboard');
    } catch (err) {
      console.error("Google Auth Error:", err);
      setError(`فشل تسجيل الدخول بجوجل: ${err.message || err.code || 'خطأ غير معروف'}`);
    } finally {
      setLoading(false);
    }
  };

  const handleVerified = async () => {
    setLoading(true);
    setError('');
    try {
      await currentUser.reload();
      if (currentUser.emailVerified) {
        navigate('/auth/complete-profile');
      } else {
        setError('لم يتم تأكيد البريد الإلكتروني بعد. يرجى مراجعة بريدك والضغط على الرابط.');
      }
    } catch (err) {
      setError('حدث خطأ أثناء التحقق، يرجى المحاولة مرة أخرى.');
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Email verification
  if (step === 2) {
    return (
      <div className="auth-page">
        <div className="auth-orb-1" />
        <div className="auth-orb-2" />
        <div className="auth-card">
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 64, marginBottom: 'var(--space-4)' }}>📬</div>
            <h2 className="auth-title">تحقق من بريدك</h2>
            <p className="auth-subtitle" style={{ marginBottom: 'var(--space-6)' }}>
              أرسلنا رابط تحقق إلى <strong style={{ color: 'var(--accent-blue-bright)' }}>{form.email}</strong>
              <br />افتح بريدك وانقر على الرابط لتفعيل حسابك
            </p>

            <div style={{
              background: 'rgba(79,159,255,0.06)',
              border: '1px solid rgba(79,159,255,0.15)',
              borderRadius: 'var(--radius-xl)',
              padding: 'var(--space-6)',
              marginBottom: 'var(--space-6)',
            }}>
              <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-muted)', lineHeight: 1.8 }}>
                ✅ تحقق من مجلد الـ Spam إذا لم يصل<br />
                ✅ قد يستغرق بضع دقائق
              </div>
            </div>

            {error && <div className="auth-error" style={{ marginBottom: 'var(--space-4)' }}>{error}</div>}

            <button className="btn-primary btn-auth" onClick={handleVerified} disabled={loading}>
              {loading ? <><div className="spinner" /> جاري التحقق...</> : <><CheckCircle2 size={18} /> تم التحقق، أكمل بياناتي</>}
            </button>

            <div style={{ marginTop: 'var(--space-4)' }}>
              <button
                onClick={sendVerificationEmail}
                style={{ background: 'none', border: 'none', color: 'var(--accent-blue)', cursor: 'pointer', fontSize: 'var(--font-size-sm)', fontFamily: 'var(--font-primary)', fontWeight: 600 }}
              >
                إعادة إرسال رابط التحقق
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-page">
      <div className="auth-orb-1" />
      <div className="auth-orb-2" />

      <div className="auth-card">
        <Link to="/" className="auth-logo">
          <div className="auth-logo-icon">⚡</div>
          <span className="auth-logo-text">Freskvv Tec EG</span>
        </Link>

        <h1 className="auth-title">إنشاء حساب جديد</h1>
        <p className="auth-subtitle">انضم إلى آلاف العملاء الراضين</p>

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
          <span>أو عبر البريد الإلكتروني</span>
        </div>

        {error && <div className="auth-error">{error}</div>}

        <form className="auth-form" onSubmit={handleRegister}>
          <div className="form-group">
            <label className="form-label">البريد الإلكتروني</label>
            <input
              id="register-email"
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
            <label className="form-label">كلمة المرور (8 أحرف على الأقل)</label>
            <div className="password-wrapper">
              <input
                id="register-password"
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

          <div className="form-group">
            <label className="form-label">تأكيد كلمة المرور</label>
            <input
              id="register-confirm"
              className="form-input"
              type="password"
              name="confirmPassword"
              placeholder="••••••••"
              value={form.confirmPassword}
              onChange={handleChange}
              required
              dir="ltr"
            />
          </div>

          <button id="register-submit" className="btn-primary btn-auth" type="submit" disabled={loading}>
            {loading ? <><div className="spinner" /> جاري الإنشاء...</> : 'إنشاء الحساب'}
          </button>
        </form>

        <p className="auth-footer">
          عندك حساب بالفعل؟ <Link to="/auth/login">تسجيل الدخول</Link>
        </p>
      </div>
    </div>
  );
}
