// Learning Page placeholder
import { Link } from 'react-router-dom';
export default function Learning() {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', paddingTop: 100, textAlign: 'center' }}>
      <div>
        <div style={{ fontSize: 64, marginBottom: 16 }}>📚</div>
        <h1 style={{ fontSize: '2rem', fontWeight: 900, marginBottom: 8 }}>المنصة التعليمية</h1>
        <p style={{ color: 'var(--text-muted)', marginBottom: 24 }}>قريباً... منصة تعليمية متكاملة للكورسات والشروحات التقنية</p>
        <Link to="/" className="btn-primary">العودة للرئيسية</Link>
      </div>
    </div>
  );
}
