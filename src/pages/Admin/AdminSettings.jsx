import { useState, useEffect } from 'react';
import { doc, getDoc, setDoc, onSnapshot } from 'firebase/firestore';
import toast from 'react-hot-toast';
import { Settings, Save, AlertTriangle, UploadCloud, Server, CheckCircle2, RefreshCw } from 'lucide-react';
import { db } from '../../firebase/config';

export default function AdminSettings() {
  const [settings, setSettings] = useState({
    maintenanceMode: false,
    siteNotice: '',
    vercelDeployHook: '',
    lastDeployedAt: null,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deploying, setDeploying] = useState(false);

  // Check if there are pending updates (compare lastCodeUpdate vs lastDeployedAt)
  const [updateAvailable, setUpdateAvailable] = useState(false);

  useEffect(() => {
    // Listen to settings in real time
    const unsub = onSnapshot(doc(db, 'settings', 'general'), (snap) => {
      if (snap.exists()) {
        const data = snap.data();
        setSettings(data);
        // Check if an update is pending
        if (data.lastCodeUpdate && data.lastDeployedAt) {
          setUpdateAvailable(data.lastCodeUpdate.toDate() > data.lastDeployedAt.toDate());
        } else if (data.lastCodeUpdate && !data.lastDeployedAt) {
          setUpdateAvailable(true);
        }
      }
      setLoading(false);
    });
    return unsub;
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

  const handleDeploy = async () => {
    // Try Deploy Hook first if available, otherwise guide user
    if (settings.vercelDeployHook) {
      setDeploying(true);
      try {
        const res = await fetch(settings.vercelDeployHook, { method: 'POST' });
        if (res.ok) {
          // Mark as deployed
          await setDoc(doc(db, 'settings', 'general'), { lastDeployedAt: new Date() }, { merge: true });
          setUpdateAvailable(false);
          toast.success('تم إرسال أمر التحديث لـ Vercel بنجاح! 🚀 سيظهر للمستخدمين خلال دقيقة.');
        } else {
          toast.error('حدث خطأ أثناء الاتصال بسيرفر Vercel، تأكد من صحة الرابط');
        }
      } catch (err) {
        toast.error('فشل الاتصال بسيرفر Vercel');
      } finally {
        setDeploying(false);
      }
    } else {
      // No hook — guide user to push via git
      toast('💡 لم يتم ضبط رابط Deploy Hook. ارفع التحديثات عبر git push وسيتحدث الموقع تلقائياً.', { duration: 5000 });
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

      {/* Update Available Banner */}
      {updateAvailable && (
        <div style={{
          background: 'linear-gradient(135deg, rgba(34,197,94,0.12), rgba(79,159,255,0.12))',
          border: '1px solid rgba(34,197,94,0.35)',
          borderRadius: 16,
          padding: '20px 24px',
          marginBottom: 24,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 16,
          animation: 'pulse 2s infinite'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 44, height: 44, borderRadius: 12, background: 'rgba(34,197,94,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <RefreshCw size={22} color="#22c55e" />
            </div>
            <div>
              <h3 style={{ fontSize: 15, fontWeight: 800, marginBottom: 2, color: '#22c55e' }}>🔔 يتوفر تحديث جديد!</h3>
              <p style={{ fontSize: 13, color: 'var(--text-secondary)' }}>تم رفع تحديثات جديدة للكود. اضغط على زر "نشر التحديث" لإتاحتها للمستخدمين.</p>
            </div>
          </div>
          <button
            onClick={handleDeploy}
            disabled={deploying}
            style={{
              display: 'flex', alignItems: 'center', gap: 8,
              background: 'linear-gradient(135deg, #16a34a, #22c55e)',
              color: 'white',
              border: 'none', padding: '12px 28px', borderRadius: 12,
              fontWeight: 800, fontSize: 14, cursor: 'pointer',
              fontFamily: 'var(--font-primary)',
              boxShadow: '0 4px 20px rgba(34,197,94,0.3)',
              transition: 'all 0.3s'
            }}
          >
            {deploying ? 'جاري النشر...' : <><UploadCloud size={18} /> نشر التحديث الآن 🚀</>}
          </button>
        </div>
      )}

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

        {/* Deploy Section — simplified */}
        <div>
          <h2 style={{ fontSize: 'var(--font-size-lg)', marginBottom: 'var(--space-2)', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Server size={20} color="var(--accent-blue)" />
            نشر تحديثات الموقع
          </h2>
          <p style={{ color: 'var(--text-secondary)', marginBottom: 'var(--space-4)', fontSize: 'var(--font-size-sm)', maxWidth: 650 }}>
            الموقع مربوط بـ <strong>GitHub + Vercel</strong>. عند رفع تحديثات للكود عبر <code style={{ background: 'rgba(255,255,255,0.06)', padding: '2px 6px', borderRadius: 4 }}>git push</code>، يتم تحديث الموقع تلقائياً خلال دقيقة. 
            يمكنك أيضاً إضافة رابط <strong>Deploy Hook</strong> (اختياري) لتشغيل التحديث يدوياً من هنا.
          </p>

          <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
            <input
              type="text"
              className="form-input"
              placeholder="رابط Deploy Hook (اختياري) — مثل: https://api.vercel.com/v1/integrations/deploy/..."
              value={settings.vercelDeployHook || ''}
              onChange={(e) => setSettings(s => ({ ...s, vercelDeployHook: e.target.value }))}
              style={{ flex: 1, direction: 'ltr', minWidth: 250 }}
            />
            <button
              onClick={handleDeploy}
              disabled={deploying}
              style={{
                display: 'flex', alignItems: 'center', gap: 8,
                background: 'linear-gradient(135deg, #16a34a, #22c55e)',
                color: 'white',
                border: 'none', padding: '12px 24px', borderRadius: '12px',
                fontWeight: 700, fontSize: 14, cursor: 'pointer',
                fontFamily: 'var(--font-primary)',
                transition: 'all 0.3s',
                whiteSpace: 'nowrap'
              }}
            >
              {deploying ? 'جاري النشر...' : <><UploadCloud size={18} /> نشر التحديثات</>}
            </button>
          </div>

          {/* Last deploy info */}
          {settings.lastDeployedAt && (
            <div style={{ marginTop: 12, display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: 'var(--text-muted)' }}>
              <CheckCircle2 size={14} color="#22c55e" />
              آخر نشر: {settings.lastDeployedAt?.toDate?.() 
                ? settings.lastDeployedAt.toDate().toLocaleDateString('ar-EG') + ' — ' + settings.lastDeployedAt.toDate().toLocaleTimeString('ar-EG')
                : new Date(settings.lastDeployedAt).toLocaleDateString('ar-EG')
              }
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
