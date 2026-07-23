// Freskvv Tec EG — Terms & Privacy Page
import { Link, useLocation } from 'react-router-dom';
import { ShieldCheck, FileText, ArrowRight } from 'lucide-react';

export default function TermsPrivacy() {
  const location = useLocation();
  const isTerms = location.pathname.includes('terms');

  return (
    <div style={{ paddingTop: 110, paddingBottom: 80, minHeight: '100vh' }}>
      <div className="container" style={{ maxWidth: 800 }}>
        
        <Link to="/" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: 'var(--text-secondary)', textDecoration: 'none', marginBottom: 24, fontSize: 14, background: 'rgba(255,255,255,0.03)', padding: '7px 16px', borderRadius: 99, border: '1px solid var(--border-glass)' }}>
          <ArrowRight size={16} /> العودة للرئيسية
        </Link>

        <div style={{ background: 'rgba(13,13,34,0.7)', border: '1px solid var(--border-glass)', borderRadius: 24, padding: '40px', backdropFilter: 'blur(20px)' }}>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
            {isTerms ? <FileText size={32} color="var(--accent-blue)" /> : <ShieldCheck size={32} color="#22c55e" />}
            <div>
              <h1 style={{ fontSize: '1.8rem', fontWeight: 900 }}>
                {isTerms ? 'شروط الاستخدام والخدمة' : 'سياسة الخصوصية وحماية البيانات'}
              </h1>
              <p style={{ color: 'var(--text-muted)', fontSize: 13 }}>تاريخ آخر تحديث: 2026</p>
            </div>
          </div>

          {isTerms ? (
            <div style={{ color: 'var(--text-secondary)', lineHeight: 1.8, fontSize: 15, display: 'flex', flexDirection: 'column', gap: 20 }}>
              <section>
                <h3 style={{ color: 'var(--text-primary)', marginBottom: 8, fontSize: '1.1rem' }}>1. القبول بالشروط</h3>
                <p>باستخدامك لمنصة Freskvv Tec EG، فإنك توافق على الالتزام بكافة الشروط والأحكام الموضحة هنا، والتي تضمن حقوق المنصة وحقوق العميل.</p>
              </section>
              <section>
                <h3 style={{ color: 'var(--text-primary)', marginBottom: 8, fontSize: '1.1rem' }}>2. تنفيذ الخدمات والطلبات</h3>
                <p>تلتزم المنصة بتنفيذ طلبات السيرفرات والتطبيقات والمنتجات وفقاً للمواصفات المحددة في الباقة. يبدأ وقت التنفيذ فور تأكيد الدفع وإيداع رصيد الطلب.</p>
              </section>
              <section>
                <h3 style={{ color: 'var(--text-primary)', marginBottom: 8, fontSize: '1.1rem' }}>3. سياسة الاسترداد والضمان</h3>
                <p>يمكن تقديم طلب استرداد الرصيد خلال 7 أيام من تاريخ الطلب في حالة عدم تنفيذ الخدمة بالمواصفات المتفق عليها.</p>
              </section>
            </div>
          ) : (
            <div style={{ color: 'var(--text-secondary)', lineHeight: 1.8, fontSize: 15, display: 'flex', flexDirection: 'column', gap: 20 }}>
              <section>
                <h3 style={{ color: 'var(--text-primary)', marginBottom: 8, fontSize: '1.1rem' }}>1. جمع البيانات والمعلومات</h3>
                <p>نحن نجمع فقط البيانات الضرورية لتنفيذ طلباتك (مثل البريد الإلكتروني، الاسم، ورقم الواتساب للتواصل والدعم الفني).</p>
              </section>
              <section>
                <h3 style={{ color: 'var(--text-primary)', marginBottom: 8, fontSize: '1.1rem' }}>2. سرية وأمان المعاملات</h3>
                <p>تتم مشفرة جميع المعاملات وتخزين سكرينات الإيداع والبيانات بأمان تام على خوادم مشفرة دون مشاركتها مع أي طرف ثالث.</p>
              </section>
              <section>
                <h3 style={{ color: 'var(--text-primary)', marginBottom: 8, fontSize: '1.1rem' }}>3. حماية الحساب</h3>
                <p>يتحمل العميل مسؤولية الحفاظ على سرية كلمة المرور الخاصة بحسابه وعدم إفشائها لأي شخص آخر.</p>
              </section>
            </div>
          )}

        </div>

      </div>
    </div>
  );
}
