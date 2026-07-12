// Freskvv Tec EG — Footer Component
import { Link } from 'react-router-dom';
import { Phone, Mail, ArrowLeft } from 'lucide-react';
import './Footer.css';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="site-footer">
      <div className="container">
        <div className="footer-grid">
          
          {/* Brand & About */}
          <div className="footer-col">
            <div className="footer-brand" style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', marginBottom: 'var(--space-3)' }}>
              <img src="/logo.svg" alt="Freskvv Tec" style={{ width: 32, height: 32 }} />
              <span className="footer-logo-text" style={{ fontWeight: 900, fontSize: 'var(--font-size-xl)', background: 'var(--gradient-main)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Freskvv Tec EG</span>
            </div>
            <p className="footer-desc">
              منصة تقنية متكاملة في مصر توفر أفضل الخدمات التقنية من سيرفرات وتطبيقات ومواقع وشحن ألعاب بأعلى معايير الجودة
            </p>
          </div>

          {/* Services Links */}
          <div className="footer-col">
            <h3 className="footer-heading">الخدمات</h3>
            <ul className="footer-links">
              <li><Link to="/services/game-servers">سيرفرات الألعاب</Link></li>
              <li><Link to="/services/apps">إنشاء تطبيقات</Link></li>
              <li><Link to="/services/websites">إنشاء مواقع</Link></li>
              <li><Link to="/services/systems">أنظمة الإدارة</Link></li>
            </ul>
          </div>

          {/* Account Links */}
          <div className="footer-col">
            <h3 className="footer-heading">الحساب</h3>
            <ul className="footer-links">
              <li><Link to="/auth/register">إنشاء حساب</Link></li>
              <li><Link to="/auth/login">تسجيل الدخول</Link></li>
              <li><Link to="/dashboard/wallet">المحفظة</Link></li>
              <li><Link to="/game-store">متجر الألعاب</Link></li>
            </ul>
          </div>

          {/* Socials & Contact */}
          <div className="footer-col">
            <h3 className="footer-heading">تواصل معنا</h3>
            <div className="footer-contact">
              <Link to="/custom-service" className="contact-item">
                <ArrowLeft size={18} /> خدمة مخصصة
              </Link>
              <a href="mailto:support@freskvv.com" className="contact-item">
                <Mail size={18} /> support@freskvv.com
              </a>
              <div className="social-links">
                <a href="https://wa.me/201221640301" target="_blank" rel="noopener noreferrer" className="social-link whatsapp">
                  <Phone size={20} />
                </a>
                <a href="#" target="_blank" rel="noopener noreferrer" className="social-link facebook">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path></svg>
                </a>
                <a href="#" target="_blank" rel="noopener noreferrer" className="social-link instagram">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="20" x="2" y="2" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" x2="17.51" y1="6.5" y2="6.5"></line></svg>
                </a>
                <a href="#" target="_blank" rel="noopener noreferrer" className="social-link tiktok">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12.53.02C13.84 0 15.14.01 16.44 0c.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.12-3.44-3.17-3.41-5.46.03-2.22 1.41-4.22 3.42-5.18 1.9-.93 4.15-.96 6.09-.08.06-1.4.02-2.81.04-4.21-1.35-.34-2.77-.32-4.14-.07-2.75.52-5.16 2.37-6.19 4.95-1.07 2.65-.58 5.76 1.12 7.97 1.63 2.11 4.23 3.39 6.89 3.34 2.89-.06 5.56-1.74 6.78-4.35 1.25-2.7 1.14-5.83 1.15-8.81-.01-3.66.01-7.32-.01-10.98z"/>
                  </svg>
                </a>
              </div>
            </div>
          </div>

        </div>

        <div className="footer-bottom">
          <p>© 2025 Freskvv Tec EG — جميع الحقوق محفوظة</p>
          <p style={{ marginTop: '8px', fontSize: '0.9rem', color: 'var(--text-muted)' }}>🇪🇬 صُنع بشغف في مصر</p>
        </div>
      </div>
    </footer>
  );
}
