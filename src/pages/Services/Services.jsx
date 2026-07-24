// Freskvv Tec EG — Services Page
import { useState, useEffect } from 'react';
import { collection, onSnapshot, orderBy, query } from 'firebase/firestore';
import { db } from '../../firebase/config';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Check, Layers, Rocket, Server, Smartphone, Globe, Settings, TrendingUp, FolderKanban, Megaphone } from 'lucide-react';
import './Services.css';

const ICON_MAP = {
  'game-servers': <Server size={32} />,
  'apps': <Smartphone size={32} />,
  'websites': <Globe size={32} />,
  'systems': <Settings size={32} />,
  'followers': <TrendingUp size={32} />,
  'project-management': <FolderKanban size={32} />,
  'social-media': <Megaphone size={32} />,
  'default': <Layers size={32} />
};

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

export default function Services() {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(collection(db, 'sections'), orderBy('createdAt', 'desc'));
    const unsub = onSnapshot(q, snap => {
      setServices(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      setLoading(false);
    });
    return unsub;
  }, []);

  return (
    <div className="services-page">
      <div className="container">
        <motion.div
          className="services-page-header"
          initial="hidden"
          animate="show"
          variants={fadeUp}
        >
          <div className="section-eyebrow" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
            <Rocket size={18} /> خدماتنا
          </div>
          <h1 className="services-page-title">
            كل ما تحتاجه من{' '}
            <span className="gradient-text">خدمات تقنية</span>
          </h1>
          <p className="services-page-desc">
            {services.length > 0 ? services.length : '...'} أقسام متخصصة بأسعار تنافسية وجودة عالمية
          </p>
        </motion.div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: 100, color: 'var(--text-muted)' }}>جاري تحميل الأقسام...</div>
        ) : services.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 100, background: 'rgba(255,255,255,0.02)', borderRadius: 16 }}>
            <Layers size={48} style={{ color: 'var(--text-muted)', marginBottom: 16, opacity: 0.5 }} />
            <h3 style={{ marginBottom: 8 }}>لا توجد خدمات متاحة حالياً</h3>
            <p style={{ color: 'var(--text-secondary)' }}>سيتم إضافة باقات وخدمات جديدة قريباً</p>
          </div>
        ) : (
          services.map((service, index) => (
            <motion.section
              key={service.slug}
              className="service-section"
              id={service.slug}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, margin: "-100px" }}
              variants={staggerContainer}
            >
              <motion.div className="service-section-header" variants={fadeUp}>
                <div className="service-section-icon" style={{ color: 'var(--accent-blue-bright)', display: 'flex', alignItems: 'center' }}>
                  {ICON_MAP[service.slug] || ICON_MAP['default']}
                </div>
                <div>
                  <h2 className="service-section-name">{service.name}</h2>
                  <p className="service-section-desc">{service.desc}</p>
                </div>
              </motion.div>

              <motion.div className="packages-grid" variants={staggerContainer}>
                {service.packages && service.packages.map(pkg => (
                  <motion.div key={pkg.id} variants={fadeUp} className={`package-card ${pkg.popular ? 'popular' : ''}`}>
                    {pkg.popular && <div className="popular-badge">⭐ الأكثر طلباً</div>}
                    <div className="package-color-line" style={{ background: pkg.color }} />
                    <div className="package-name">{pkg.name}</div>
                    <div className="package-price">
                      {pkg.price}
                      <span>ج.م</span>
                    </div>
                    <div className="package-features">
                      {pkg.features && pkg.features.map(f => (
                        <div key={f} className="package-feature">
                          <Check size={14} style={{ color: pkg.color, flexShrink: 0 }} />
                          <span>{f}</span>
                        </div>
                      ))}
                    </div>
                    <Link
                      to={`/services/${service.slug}?pkg=${pkg.id}`}
                      className="btn-primary"
                      style={{ width: '100%', justifyContent: 'center', background: `linear-gradient(135deg, ${pkg.color || 'var(--accent-blue)'}, ${(pkg.color || 'var(--accent-blue)')}bb)` }}
                    >
                      اشتراك الآن
                    </Link>
                  </motion.div>
                ))}
              </motion.div>
            </motion.section>
          )))}
      </div>
    </div>
  );
}
