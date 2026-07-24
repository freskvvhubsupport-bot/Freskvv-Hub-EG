// Freskvv Tec EG — Footer Component
import { Link } from 'react-router-dom';
import { Phone, Mail, ArrowLeft } from 'lucide-react';
import { useSettings } from '../../contexts/SettingsContext';
import { getTranslation } from '../../utils/translations';
import './Footer.css';

export default function Footer() {
  const currentYear = new Date().getFullYear();
  const { language } = useSettings();
  const t = (key) => getTranslation(language, key);

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
              {t('footerDesc')}
            </p>
          </div>

          {/* Services Links */}
          <div className="footer-col">
            <h3 className="footer-heading">{t('footerColServices')}</h3>
            <ul className="footer-links">
              <li><Link to="/services/game-servers">{t('portfolioCatServers')}</Link></li>
              <li><Link to="/services/apps">{t('portfolioCatApps')}</Link></li>
              <li><Link to="/services/websites">{t('portfolioCatSystems')}</Link></li>
              <li><Link to="/services/systems">{t('navServices')}</Link></li>
            </ul>
          </div>

          {/* Account Links */}
          <div className="footer-col">
            <h3 className="footer-heading">{t('footerColAccount')}</h3>
            <ul className="footer-links">
              <li><Link to="/auth/register">{t('navRegister')}</Link></li>
              <li><Link to="/auth/login">{t('navLogin')}</Link></li>
              <li><Link to="/dashboard/wallet">{t('navWallet')}</Link></li>
              <li><Link to="/dashboard/points">{t('heroCardPoints')} ⭐</Link></li>
              <li><Link to="/game-store">{t('navGameStore')}</Link></li>
              <li><Link to="/community">{t('navReviews')}</Link></li>
            </ul>
          </div>

          {/* Socials & Contact */}
          <div className="footer-col">
            <h3 className="footer-heading">{t('footerColContact')}</h3>
            <div className="footer-contact">
              <Link to="/custom-service" className="contact-item">
                <ArrowLeft size={18} /> {t('navCustom')}
              </Link>
              <a href="mailto:freskvv.services@gmail.com" className="contact-item">
                <Mail size={18} /> freskvv.services@gmail.com
              </a>
              <a href="https://wa.me/201221640301" target="_blank" rel="noopener noreferrer" className="contact-item" style={{ color: 'var(--accent-green-bright, #22c55e)' }}>
                <Phone size={18} /> 01221640301 <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{t('footerEmergency')}</span>
              </a>
              
              <div style={{ marginTop: 12 }}>
                <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 8 }}>تابعنا على انستجرام:</div>
                <div className="social-links">
                  <a href="https://instagram.com/freskvv_tec_eg" target="_blank" rel="noopener noreferrer" className="social-link instagram" title="تابعنا على انستجرام">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="20" x="2" y="2" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" x2="17.51" y1="6.5" y2="6.5"></line></svg>
                  </a>
                  <a href="https://wa.me/201221640301" target="_blank" rel="noopener noreferrer" className="social-link whatsapp" title="واتساب الطوارئ">
                    <Phone size={20} />
                  </a>
                </div>
              </div>
            </div>
          </div>

        </div>

        <div className="footer-bottom">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
            <p>© {currentYear} Freskvv Tec EG — {t('footerRights')}</p>
            <div style={{ display: 'flex', gap: 20, fontSize: '0.85rem' }}>
              <Link to="/terms" style={{ color: 'var(--text-muted)', textDecoration: 'none', transition: 'color 0.2s' }} onMouseEnter={e => e.target.style.color = 'var(--accent-blue-bright)'} onMouseLeave={e => e.target.style.color = 'var(--text-muted)'}>{t('footerTerms')}</Link>
              <Link to="/privacy" style={{ color: 'var(--text-muted)', textDecoration: 'none', transition: 'color 0.2s' }} onMouseEnter={e => e.target.style.color = 'var(--accent-blue-bright)'} onMouseLeave={e => e.target.style.color = 'var(--text-muted)'}>{t('footerPrivacy')}</Link>
              <Link to="/community" style={{ color: 'var(--text-muted)', textDecoration: 'none', transition: 'color 0.2s' }} onMouseEnter={e => e.target.style.color = 'var(--accent-blue-bright)'} onMouseLeave={e => e.target.style.color = 'var(--text-muted)'}>{t('footerCommunity')}</Link>
            </div>
          </div>
          <p style={{ marginTop: '10px', fontSize: '0.85rem', color: 'var(--text-muted)', textAlign: 'center' }}>{t('footerMadeIn')}</p>
        </div>
      </div>
    </footer>
  );
}
