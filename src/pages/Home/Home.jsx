// Freskvv Tec EG — Home Page (Animated with Framer Motion & Lucide Icons)
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  ArrowLeft, Zap, Shield, Clock, Star, Users, GamepadIcon, ChevronLeft, 
  Server, Smartphone, Globe, Settings, TrendingUp, FolderKanban, Megaphone,
  CreditCard, Award, Rocket, Layers, ArrowRight
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { collection, onSnapshot, orderBy, query } from 'firebase/firestore';
import { db } from '../../firebase/config';
import Testimonials from '../../components/UI/Testimonials';
import Portfolio from '../../components/UI/Portfolio';
import { useSettings } from '../../contexts/SettingsContext';
import { getTranslation } from '../../utils/translations';
import { isNew } from '../../utils/newBadge';
import './Home.css';

// Animated stars generator
const STARS = Array.from({ length: 80 }, (_, i) => ({
  id: i,
  x: Math.random() * 100,
  y: Math.random() * 100,
  size: Math.random() * 2.5 + 0.5,
  duration: Math.random() * 4 + 2,
  delay: Math.random() * 5,
}));

const ICON_MAP = {
  'game-servers': <Server size={28} />,
  'apps': <Smartphone size={28} />,
  'websites': <Globe size={28} />,
  'systems': <Settings size={28} />,
  'followers': <TrendingUp size={28} />,
  'project-management': <FolderKanban size={28} />,
  'social-media': <Megaphone size={28} />,
  'default': <Layers size={28} />
};

const GAMES = [
  { id: 1, icon: '🔫', name: 'PUBG Mobile', tag: 'UC' },
  { id: 2, icon: '⚔️', name: 'Free Fire', tag: 'Diamonds' },
  { id: 3, icon: '🏆', name: 'Mobile Legends', tag: 'Diamonds' },
  { id: 4, icon: '🎯', name: 'Call of Duty', tag: 'CP' },
  { id: 5, icon: '⚡', name: 'Fortnite', tag: 'V-Bucks' },
  { id: 6, icon: '🌟', name: 'Clash of Clans', tag: 'Gems' },
];

const staggerContainer = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
};

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 80, damping: 20 } }
};

export default function Home() {
  const [dynamicServices, setDynamicServices] = useState([]);
  const { language } = useSettings();
  const isAr = language === 'ar';
  const t = (key) => getTranslation(language, key);

  const FEATURES = [
    { icon: <Zap size={36} />, name: t('featSpeed'), desc: t('featSpeedDesc') },
    { icon: <Shield size={36} />, name: t('featSecurity'), desc: t('featSecurityDesc') },
    { icon: <Award size={36} />, name: t('featQuality'), desc: t('featQualityDesc') },
    { icon: <Users size={36} />, name: t('featSupport24'), desc: t('featSupport24Desc') },
    { icon: <CreditCard size={36} />, name: t('featPayment'), desc: t('featPaymentDesc') },
    { icon: <Star size={36} />, name: t('featRewards'), desc: t('featRewardsDesc') },
  ];

  useEffect(() => {
    const q = query(collection(db, 'sections'), orderBy('createdAt', 'desc'));
    const unsub = onSnapshot(q, snap => {
      setDynamicServices(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });
    return unsub;
  }, []);

  return (
    <main>
      {/* ── Hero Section ── */}
      <section className="hero bg-animated">
        {/* Stars */}
        <div className="hero-stars" aria-hidden="true">
          {STARS.map(s => (
            <div
              key={s.id}
              className="hero-star"
              style={{
                left: `${s.x}%`,
                top: `${s.y}%`,
                width: `${s.size}px`,
                height: `${s.size}px`,
                '--duration': `${s.duration}s`,
                '--delay': `${s.delay}s`,
              }}
            />
          ))}
        </div>

        <div className="hero-orb hero-orb-1" aria-hidden="true" />
        <div className="hero-orb hero-orb-2" aria-hidden="true" />
        <div className="hero-orb hero-orb-3" aria-hidden="true" />
        <div className="hero-grid" aria-hidden="true" />

        <div className="container">
          <div className="hero-content">
            {/* Text */}
            <motion.div 
              className="hero-text"
              initial={{ opacity: 0, x: isAr ? 50 : -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, type: 'spring' }}
            >
              <div className="hero-eyebrow">
                <span className="hero-eyebrow-dot" />
                {t('heroEyebrow')}
              </div>

              <h1 className="hero-title">
                {t('heroTitleLine1')}
                <span className="hero-title-line2"> {t('heroTitleLine2')}</span>
                <br />{t('heroTitleLine3')}
              </h1>

              <p className="hero-description">
                {t('heroDesc')}
              </p>

              <div className="hero-actions">
                <Link to="/custom-service" className="btn-primary" style={{ fontSize: 'var(--font-size-lg)', padding: 'var(--space-4) var(--space-8)' }}>
                  <Zap size={18} />
                  {t('heroStartProject')}
                </Link>
                <Link to="/services" className="btn-ghost" style={{ fontSize: 'var(--font-size-lg)', padding: 'var(--space-4) var(--space-8)' }}>
                  <Rocket size={18} />
                  {t('heroExploreServices')}
                </Link>
              </div>

              <motion.div 
                className="hero-stats"
                initial="hidden"
                animate="show"
                variants={staggerContainer}
              >
                {[
                  { value: '500+', label: t('statClients') },
                  { value: dynamicServices.length > 0 ? dynamicServices.length.toString() : '...', label: t('statSections') },
                  { value: '24/7', label: t('statSupport') },
                ].map(stat => (
                  <motion.div key={stat.label} variants={fadeUp}>
                    <div className="hero-stat-value">{stat.value}</div>
                    <div className="hero-stat-label">{stat.label}</div>
                  </motion.div>
                ))}
              </motion.div>
            </motion.div>

            {/* Phone Mockup */}
            <motion.div 
              className="hero-visual"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1, type: 'spring', delay: 0.2 }}
            >
              <div className="hero-phone-mockup">
                {/* Floating Cards */}
                <div className="floating-card floating-card-1">
                  <div className="floating-card-label">{t('heroCardWallet')}</div>
                  <div className="floating-card-value">350 {t('currency')} 💳</div>
                </div>
                <div className="floating-card floating-card-2">
                  <div className="floating-card-label">{t('heroCardPoints')}</div>
                  <div className="floating-card-value">1,250 ⭐</div>
                </div>
                <div className="floating-card floating-card-3">
                  <div className="floating-card-label">{t('heroCardOrder')}</div>
                  <div className="floating-card-value">{t('heroCardStatus')}</div>
                </div>

                <div className="hero-phone-frame">
                  <div className="hero-phone-screen">
                    <div className="phone-island">
                      <div className="phone-island-dot" />
                      <span style={{ fontSize: '10px', color: 'rgba(255,255,255,0.6)' }}>Freskvv Tec</span>
                      <div className="phone-island-dot" />
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                      {dynamicServices.slice(0, 4).map(s => (
                        <div key={s.name} style={{
                          background: 'rgba(79,159,255,0.06)',
                          border: '1px solid rgba(79,159,255,0.15)',
                          borderRadius: '12px',
                          padding: '10px',
                          textAlign: 'center',
                          color: 'var(--accent-blue-bright)'
                        }}>
                          <div style={{ marginBottom: '4px', display: 'flex', justifyContent: 'center' }}>
                            {ICON_MAP[s.slug] || ICON_MAP['default']}
                          </div>
                          <div style={{ fontSize: '9px', color: 'var(--text-secondary)', fontWeight: 600 }}>
                            {s.name?.split(' ')[1] || s.name}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── Services Section ── */}
      <section className="services-section" id="services">
        <div className="container">
          <motion.div 
            className="section-header"
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            variants={fadeUp}
          >
            <div className="section-eyebrow" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
              <Rocket size={18} /> {t('servicesEyebrow')}
            </div>
            <h2 className="section-title">
              {t('servicesTitle1')}{' '}
              <span className="gradient-text">{t('servicesTitle2')}</span>
            </h2>
            <p className="section-desc">
              {t('servicesDesc')}
            </p>
          </motion.div>

          <motion.div 
            className="services-grid"
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            variants={staggerContainer}
          >
            {dynamicServices.map(service => {
              const newlyAdded = isNew(service.createdAt);
              return (
                <motion.div key={service.slug} variants={fadeUp}>
                  <Link to={`/services/${service.slug}`} className="service-card" style={{ position: 'relative' }}>
                    {newlyAdded && (
                      <div style={{ position: 'absolute', top: 16, left: isAr ? 'auto' : 16, right: isAr ? 16 : 'auto' }}>
                        <span className="new-badge">
                          {t('badgeNew')}
                        </span>
                      </div>
                    )}
                    <div className="service-icon-wrap" style={{ color: 'white' }}>
                      {ICON_MAP[service.slug] || ICON_MAP['default']}
                    </div>
                    <h3 className="service-name">{service.name}</h3>
                    <p className="service-desc">{service.desc}</p>
                    <div className="service-packages">
                      <span className="service-pkg-count">{service.packages ? service.packages.length : 0} {t('servicePkgsAvailable')}</span>
                      <div className="service-arrow" style={{ display: 'flex', alignItems: 'center', gap: 4, color: 'var(--accent-blue-bright)', fontWeight: 700, fontSize: 13 }}>
                        {t('serviceViewPkgs')} {isAr ? <ChevronLeft size={16} /> : <ArrowRight size={16} />}
                      </div>
                    </div>
                  </Link>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </section>

      {/* ── Features ── */}
      <section className="features-section">
        <div className="container">
          <motion.div 
            className="section-header"
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            variants={fadeUp}
          >
            <div className="section-eyebrow">{t('featuresEyebrowHeader')}</div>
            <h2 className="section-title">
              {t('featuresTitleHeader1')}{' '}
              <span className="gradient-text">{t('featuresTitleHeader2')}</span>
            </h2>
          </motion.div>

          <motion.div 
            className="features-grid"
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            variants={staggerContainer}
          >
            {FEATURES.map(f => (
              <motion.div key={f.name} variants={fadeUp} className="feature-card">
                <div className="feature-icon" style={{ color: 'var(--accent-blue)', display: 'flex', justifyContent: 'center' }}>
                  {f.icon}
                </div>
                <h3 className="feature-name">{f.name}</h3>
                <p className="feature-desc">{f.desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── Portfolio Section ── */}
      <Portfolio />

      {/* ── Testimonials ── */}
      <Testimonials />

      {/* ── Game Store Preview ── */}
      <section className="game-store-preview">
        <div className="container">
          <motion.div 
            className="section-header" 
            style={{ textAlign: isAr ? 'right' : 'left', marginBottom: 'var(--space-8)' }}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            variants={fadeUp}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 'var(--space-4)' }}>
              <div>
                <div className="section-eyebrow" style={{ display: 'inline-flex', marginBottom: 'var(--space-3)' }}>{t('gameStorePreviewEyebrow')}</div>
                <h2 className="section-title" style={{ marginBottom: 'var(--space-2)' }}>
                  {t('gameStorePreviewTitle1')} <span className="gradient-text">{t('gameStorePreviewTitle2')}</span>
                </h2>
                <p style={{ color: 'var(--text-muted)', fontSize: 'var(--font-size-sm)' }}>{t('gameStorePreviewSub')}</p>
              </div>
              <Link to="/game-store" className="btn-ghost">
                {t('gameStoreViewAll')} {isAr ? <ArrowLeft size={16} /> : <ArrowRight size={16} />}
              </Link>
            </div>
          </motion.div>

          <motion.div 
            className="games-scroll"
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            variants={staggerContainer}
          >
            {GAMES.map(game => (
              <motion.div key={game.id} variants={fadeUp} className="game-card">
                <div className="game-card-img">{game.icon}</div>
                <div className="game-card-body">
                  <div className="game-card-name">{game.name}</div>
                  <div className="game-card-tag">{game.tag}</div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="cta-section">
        <div className="container">
          <motion.div 
            className="cta-card"
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, type: 'spring' }}
          >
            <h2 className="cta-title">
              {t('ctaTitle1')}{' '}
              <span className="gradient-text">{t('ctaTitle2')}</span>
            </h2>
            <p className="cta-desc">
              {t('ctaDesc')}
            </p>
            <div className="cta-actions">
              <Link to="/auth/register" className="btn-primary" style={{ fontSize: 'var(--font-size-lg)', padding: 'var(--space-4) var(--space-10)' }}>
                <Zap size={18} />
                {t('ctaRegisterBtn')}
              </Link>
              <Link to="/custom-service" className="btn-ghost" style={{ fontSize: 'var(--font-size-lg)', padding: 'var(--space-4) var(--space-8)' }}>
                {t('ctaCustomBtn')}
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

    </main>
  );
}
