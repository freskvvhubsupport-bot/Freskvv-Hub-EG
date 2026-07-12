// Freskvv Tec EG — Complete Profile (multi-step)
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import toast from 'react-hot-toast';
import { useAuth } from '../../contexts/AuthContext';
import { db } from '../../firebase/config';
import './Auth.css';

const STEPS = ['بياناتك الشخصية', 'معلومات التواصل', 'استبيان سريع'];

const HOW_OPTIONS = [
  'عبر جوجل',
  'عبر يوتيوب',
  'عبر فيسبوك / إنستجرام',
  'من صديق أو معارف',
  'عبر تيك توك',
  'عبر إعلان ممول',
  'أخرى',
];

export default function CompleteProfile() {
  const [step, setStep] = useState(0);
  const [form, setForm] = useState({
    fullName: '',
    age: '',
    gender: '',
    whatsapp: '',
    howFound: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { currentUser, fetchUserProfile } = useAuth();
  const navigate = useNavigate();

  const set = (key, val) => setForm(f => ({ ...f, [key]: val }));

  const nextStep = () => {
    setError('');
    if (step === 0) {
      if (!form.fullName.trim() || form.fullName.trim().split(' ').length < 2) {
        setError('يرجى إدخال الاسم بالكامل (اسمان على الأقل)');
        return;
      }
      if (!form.age || form.age < 10 || form.age > 100) {
        setError('يرجى إدخال عمر صحيح');
        return;
      }
      if (!form.gender) {
        setError('يرجى اختيار النوع');
        return;
      }
    }
    if (step === 1) {
      if (!form.whatsapp || form.whatsapp.length < 10) {
        setError('يرجى إدخال رقم واتساب صحيح');
        return;
      }
    }
    setStep(s => s + 1);
  };

  const handleSubmit = async () => {
    if (!form.howFound) {
      setError('يرجى اختيار كيف عثرت علينا');
      return;
    }
    setLoading(true);
    try {
      await updateDoc(doc(db, 'users', currentUser.uid), {
        fullName: form.fullName.trim(),
        age: parseInt(form.age),
        gender: form.gender,
        whatsapp: form.whatsapp.trim(),
        howFound: form.howFound,
        profileComplete: true,
        updatedAt: serverTimestamp(),
      });
      await fetchUserProfile(currentUser.uid);
      toast.success('تم حفظ بياناتك بنجاح 🎉');
      navigate('/dashboard');
    } catch (err) {
      setError('حدث خطأ أثناء الحفظ، حاول مرة أخرى');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-orb-1" />
      <div className="auth-orb-2" />

      <div className="auth-card" style={{ maxWidth: 520 }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 'var(--space-6)' }}>
          <div style={{ fontSize: 48, marginBottom: 'var(--space-2)' }}>👤</div>
          <h1 className="auth-title">أكمل ملفك الشخصي</h1>
          <p className="auth-subtitle">بعض المعلومات للتواصل معك بشكل أفضل</p>
        </div>

        {/* Steps */}
        <div className="auth-steps">
          {STEPS.map((s, i) => (
            <>
              <div key={s} className={`auth-step ${i === step ? 'active' : i < step ? 'done' : 'pending'}`}>
                {i < step ? '✓' : i + 1}
              </div>
              {i < STEPS.length - 1 && <div key={`line-${i}`} className="auth-step-line" />}
            </>
          ))}
        </div>

        <div style={{ fontWeight: 700, textAlign: 'center', marginBottom: 'var(--space-6)', color: 'var(--text-secondary)' }}>
          {STEPS[step]}
        </div>

        {error && <div className="auth-error" style={{ marginBottom: 'var(--space-4)' }}>{error}</div>}

        {/* Step 0: Personal Info */}
        {step === 0 && (
          <div className="auth-form">
            <div className="form-group">
              <label className="form-label">الاسم بالكامل *</label>
              <input
                id="profile-fullname"
                className="form-input"
                type="text"
                placeholder="محمد أحمد محمود"
                value={form.fullName}
                onChange={e => set('fullName', e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">السن *</label>
              <input
                id="profile-age"
                className="form-input"
                type="number"
                placeholder="25"
                min="10"
                max="100"
                value={form.age}
                onChange={e => set('age', e.target.value)}
                required
                dir="ltr"
              />
            </div>

            <div className="form-group">
              <label className="form-label">النوع *</label>
              <div className="radio-group">
                {[{ val: 'male', label: '👦 ذكر' }, { val: 'female', label: '👧 أنثى' }].map(opt => (
                  <label key={opt.val} className={`radio-option ${form.gender === opt.val ? 'selected' : ''}`}>
                    <input
                      type="radio"
                      name="gender"
                      value={opt.val}
                      checked={form.gender === opt.val}
                      onChange={() => set('gender', opt.val)}
                    />
                    {opt.label}
                  </label>
                ))}
              </div>
            </div>

            <button className="btn-primary btn-auth" onClick={nextStep}>
              التالي ←
            </button>
          </div>
        )}

        {/* Step 1: WhatsApp */}
        {step === 1 && (
          <div className="auth-form">
            <div style={{
              background: 'rgba(79,159,255,0.06)',
              border: '1px solid rgba(79,159,255,0.15)',
              borderRadius: 'var(--radius-xl)',
              padding: 'var(--space-5)',
              marginBottom: 'var(--space-4)',
              fontSize: 'var(--font-size-sm)',
              color: 'var(--text-secondary)',
              lineHeight: 1.8,
            }}>
              📱 رقم الواتساب هيُستخدم فقط للتواصل معك في حالة وجود مشكلة في طلبك أو للإجابة على استفساراتك
            </div>

            <div className="form-group">
              <label className="form-label">رقم الواتساب * (بدون كود الدولة)</label>
              <input
                id="profile-whatsapp"
                className="form-input"
                type="tel"
                placeholder="01XXXXXXXXX"
                value={form.whatsapp}
                onChange={e => set('whatsapp', e.target.value.replace(/\D/g, ''))}
                required
                dir="ltr"
                maxLength={11}
              />
            </div>

            <div style={{ display: 'flex', gap: 'var(--space-3)' }}>
              <button className="btn-ghost" onClick={() => setStep(0)} style={{ flex: 1 }}>
                ← رجوع
              </button>
              <button className="btn-primary" onClick={nextStep} style={{ flex: 2 }}>
                التالي ←
              </button>
            </div>
          </div>
        )}

        {/* Step 2: Survey */}
        {step === 2 && (
          <div className="auth-form">
            <div className="form-group">
              <label className="form-label">كيف عثرت على Freskvv Tec EG؟ *</label>
              <div className="radio-group">
                {HOW_OPTIONS.map(opt => (
                  <label key={opt} className={`radio-option ${form.howFound === opt ? 'selected' : ''}`}>
                    <input
                      type="radio"
                      name="howFound"
                      value={opt}
                      checked={form.howFound === opt}
                      onChange={() => set('howFound', opt)}
                    />
                    {opt}
                  </label>
                ))}
              </div>
            </div>

            <div style={{ display: 'flex', gap: 'var(--space-3)' }}>
              <button className="btn-ghost" onClick={() => setStep(1)} style={{ flex: 1 }}>
                ← رجوع
              </button>
              <button
                id="profile-submit"
                className="btn-primary"
                onClick={handleSubmit}
                disabled={loading}
                style={{ flex: 2 }}
              >
                {loading ? <><div className="spinner" /> جاري الحفظ...</> : '🎉 إنهاء'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
