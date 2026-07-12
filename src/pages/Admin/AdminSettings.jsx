import { useState, useEffect } from 'react';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import toast from 'react-hot-toast';
import { Settings, Save, AlertTriangle, UploadCloud, Server } from 'lucide-react';
import { db } from '../../firebase/config';

export default function AdminSettings() {
  const [settings, setSettings] = useState({
    maintenanceMode: false,
    siteNotice: '',
    vercelDeployHook: '',
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deploying, setDeploying] = useState(false);

  const handleDeploy = async () => {
    if (!settings.vercelDeployHook) {
      toast.error('يرجى إضافة رابط Vercel Deploy Hook في الأسفل وحفظ الإعدادات أولاً');
      return;
    }
    setDeploying(true);
    try {
      const res = await fetch(settings.vercelDeployHook, { method: 'POST' });
      if (res.ok) {
        toast.success('تم إرسال أمر التحديث لـ Vercel بنجاح! 🚀 التحديث سيظهر للمستخدمين خلال ثوانٍ.');
      } else {
        toast.error('حدث خطأ أثناء الاتصال بسيرفر Vercel');
      }
    } catch (err) {
      toast.error('فشل الاتصال بسيرفر Vercel');
    } finally {
      setDeploying(false);
    }
  };

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const snap = await getDoc(doc(db, 'settings', 'general'));
        if (snap.exists()) {
          setSettings(snap.data());
        }
      } catch (err) {
        toast.error('فشل جلب الإعدادات');
      } finally {
        setLoading(false);
      }
    };
    fetchSettings();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      await setDoc(doc(db, 'settings', 'general'), settings, { merge: true });
      toast.success('تم حفظ الإعدادات بنجاح');
    } catch (err) {
      toast.error('حدث خطأ أثناء الحفظ');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div style={{ padding: 'var(--space-6)' }}>جاري التحميل...</div>;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-6)' }}>
        <h1 style={{ fontSize: 'var(--font-size-2xl)', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '12px' }}>
          <Settings size={28} color="var(--accent-blue)" />
          إعدادات الموقع
        </h1>
        <button
          className="btn-primary"
          onClick={handleSave}
          disabled={saving}
          style={{ padding: '8px 24px' }}
        >
          {saving ? 'جاري الحفظ...' : <><Save size={18} /> حفظ التغييرات</>}
        </button>
      </div>

      <div style={{
        background: 'rgba(10, 10, 26, 0.5)',
        border: '1px solid var(--border-glass)',
        borderRadius: 'var(--radius-xl)',
        padding: 'var(--space-6)',
      }}>
        
        {/* Maintenance Mode */}
        <div style={{ marginBottom: 'var(--space-6)', borderBottom: '1px solid var(--border-glass)', paddingBottom: 'var(--space-6)' }}>
          <h2 style={{ fontSize: 'var(--font-size-lg)', marginBottom: 'var(--space-2)', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <AlertTriangle size={20} color={settings.maintenanceMode ? 'var(--accent-orange)' : 'var(--text-muted)'} />
            وضع الصيانة
          </h2>
          <p style={{ color: 'var(--text-secondary)', marginBottom: 'var(--space-4)', fontSize: 'var(--font-size-sm)' }}>
            عند تفعيل وضع الصيانة، لن يتمكن أي مستخدم عادي من تصفح الموقع، وسيظهر له رسالة تفيد بأن الموقع تحت الصيانة. المدراء فقط هم من يمكنهم الدخول.
          </p>
          
          <label style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }}>
            <div style={{
              width: '44px',
              height: '24px',
              background: settings.maintenanceMode ? 'var(--accent-orange)' : 'rgba(255,255,255,0.1)',
              borderRadius: '24px',
              position: 'relative',
              transition: '0.3s'
            }}>
              <div style={{
                width: '20px',
                height: '20px',
                background: 'white',
                borderRadius: '50%',
                position: 'absolute',
                top: '2px',
                left: settings.maintenanceMode ? '22px' : '2px',
                transition: '0.3s'
              }} />
            </div>
            <input
              type="checkbox"
              style={{ display: 'none' }}
              checked={settings.maintenanceMode}
              onChange={(e) => setSettings(s => ({ ...s, maintenanceMode: e.target.checked }))}
            />
            <span style={{ fontWeight: 600 }}>
              {settings.maintenanceMode ? 'مفعل (الموقع مغلق للزوار)' : 'معطل (الموقع متاح للجميع)'}
            </span>
          </label>
        </div>

        {/* Global Notice */}
        <div style={{ marginBottom: 'var(--space-6)', borderBottom: '1px solid var(--border-glass)', paddingBottom: 'var(--space-6)' }}>
          <h2 style={{ fontSize: 'var(--font-size-lg)', marginBottom: 'var(--space-2)' }}>إشعار عام</h2>
          <p style={{ color: 'var(--text-secondary)', marginBottom: 'var(--space-4)', fontSize: 'var(--font-size-sm)' }}>
            نص سيظهر في أعلى جميع صفحات الموقع كإشعار عام للزوار (اتركه فارغاً لإلغائه).
          </p>
          <input
            type="text"
            className="form-input"
            placeholder="مثال: خصم 50% بمناسبة الافتتاح!"
            value={settings.siteNotice || ''}
            onChange={(e) => setSettings(s => ({ ...s, siteNotice: e.target.value }))}
          />
        </div>

        {/* Vercel Deploy integration */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 16 }}>
            <div>
              <h2 style={{ fontSize: 'var(--font-size-lg)', marginBottom: 'var(--space-2)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Server size={20} color="var(--accent-blue)" />
                تحديث الموقع (Vercel)
              </h2>
              <p style={{ color: 'var(--text-secondary)', marginBottom: 'var(--space-4)', fontSize: 'var(--font-size-sm)', maxWidth: 600 }}>
                اربط لوحة التحكم بسيرفر Vercel لتتمكن من نشر التحديثات بضغطة زر. ضع رابط <strong>Deploy Hook</strong> الذي ستحصل عليه من إعدادات مشروعك في Vercel، ثم احفظ الإعدادات لتفعيل الزر.
              </p>
            </div>
            
            <button
              onClick={handleDeploy}
              disabled={deploying || !settings.vercelDeployHook}
              style={{
                display: 'flex', alignItems: 'center', gap: 8,
                background: settings.vercelDeployHook ? 'linear-gradient(135deg, #16a34a, #22c55e)' : 'rgba(255,255,255,0.05)',
                color: settings.vercelDeployHook ? 'white' : 'var(--text-muted)',
                border: 'none', padding: '12px 24px', borderRadius: '12px',
                fontWeight: 700, fontSize: 14, cursor: settings.vercelDeployHook ? 'pointer' : 'not-allowed',
                transition: 'all 0.3s'
              }}
            >
              {deploying ? 'جاري إرسال الطلب...' : <><UploadCloud size={18} /> نشر التحديثات الآن</>}
            </button>
          </div>
          
          <input
            type="text"
            className="form-input"
            placeholder="https://api.vercel.com/v1/integrations/deploy/prj_xxxxx/xxxxx"
            value={settings.vercelDeployHook || ''}
            onChange={(e) => setSettings(s => ({ ...s, vercelDeployHook: e.target.value }))}
            style={{ marginTop: 12, direction: 'ltr' }}
          />
        </div>

      </div>
    </div>
  );
}
