// Freskvv Tec EG — Portfolio Showcase Component
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ExternalLink, FolderKanban, Server, Smartphone, Globe, Shield, Sparkles, ArrowLeft } from 'lucide-react';
import { useSettings } from '../../contexts/SettingsContext';
import { getTranslation } from '../../utils/translations';
import './Portfolio.css';

const PROJECTS = [
  {
    id: 1,
    title: 'سيرفر FiveM و Discord متكامل',
    category: 'servers',
    categoryLabel: 'سيرفرات الألعاب',
    image: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=600&h=380&fit=crop',
    description: 'تجهيز سيرفر فايف إم كامل بأحدث الرومات والنصوص البرمجية وحماية Anti-Cheat متقدمة مع ربط قاعدة البيانات.',
    tags: ['FiveM', 'Discord Bot', 'MySQL', 'Anti-Cheat'],
    stats: 'تتحمل +200 لاعب بالتوازي',
    badge: 'مكتمل ✅'
  },
  {
    id: 2,
    title: 'تطبيق متجر إلكتروني للملابس',
    category: 'apps',
    categoryLabel: 'تطبيقات الهواتف',
    image: 'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=600&h=380&fit=crop',
    description: 'تطبيق هواتف ذكية (iOS & Android) يدعم الدفع الإلكتروني بالمحفظة وشحن فوري وإشعارات لحظية.',
    tags: ['React Native', 'Firebase', 'Orange Cash', 'PWA'],
    stats: '+10,000 تحميل',
    badge: 'مكتمل ✅'
  },
  {
    id: 3,
    title: 'منصة إدارة وتتبع المشاريع (ERP)',
    category: 'systems',
    categoryLabel: 'أنظمة ومواقع',
    image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=600&h=380&fit=crop',
    description: 'لوحة تحكم إدارية ذكية للشركات والمصانع لمتابعة مخزون البضائع، المبيعات، وتقارير الأرباح لحظة بلحظة.',
    tags: ['React', 'Node.js', 'Dashboard', 'Analytics'],
    stats: 'أوتوماتيكية 100%',
    badge: 'مكتمل ✅'
  },
  {
    id: 4,
    title: 'موقع شركة تطوير وتأمين عقاري',
    category: 'systems',
    categoryLabel: 'أنظمة ومواقع',
    image: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=600&h=380&fit=crop',
    description: 'موقع تعريفي فاخر مزود بحاسبة تمويل تفاعلية وخريطة مشاريع وأداة حجز مواعيد الدعم الفني.',
    tags: ['Next.js', 'SEO Ultra', 'Animations', 'Tailwind'],
    stats: 'سرعة تحضير 99/100',
    badge: 'مكتمل ✅'
  },
  {
    id: 5,
    title: 'بوت ديسكورد للشحن الأوتوماتيكي',
    category: 'servers',
    categoryLabel: 'سيرفرات الألعاب',
    image: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=600&h=380&fit=crop',
    description: 'بوت أوتوماتيكي يتصل بمحفظة الموقع لإتمام طلبات شحن UC وبطاقات الألعاب فور التحويل مباشرة دون تدخل بشري.',
    tags: ['Discord.js', 'Webhooks', 'Automating', 'API'],
    stats: 'إنجاز خلال 15 ثانية',
    badge: 'مكتمل ✅'
  },
  {
    id: 6,
    title: 'منصة تعلم تقني وشروحات مجانية',
    category: 'apps',
    categoryLabel: 'تطبيقات وهواتف',
    image: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=600&h=380&fit=crop',
    description: 'منصة تعليمية تقدم كورسات تفاعلية في البرمجة وإدارة السيرفرات مع اختبارات وشهادات إتمام أوتوماتيكية.',
    tags: ['Video Streaming', 'LMS', 'Interactive UI'],
    stats: '+50 كورس تقني',
    badge: 'مكتمل ✅'
  }
];

const CATEGORIES = [
  { key: 'all', label: '🌟 كل الأعمال' },
  { key: 'servers', label: '🎮 سيرفرات الألعاب' },
  { key: 'apps', label: '📱 التطبيقات والموبايل' },
  { key: 'systems', label: '💻 المواقع والأنظمة' }
];

export default function Portfolio() {
  const [filter, setFilter] = useState('all');
  const { language } = useSettings();
  const t = (key) => getTranslation(language, key);

  const categories = [
    { key: 'all', label: t('portfolioCatAll') },
    { key: 'servers', label: t('portfolioCatServers') },
    { key: 'apps', label: t('portfolioCatApps') },
    { key: 'systems', label: t('portfolioCatSystems') }
  ];

  const filteredProjects = filter === 'all' 
    ? PROJECTS 
    : PROJECTS.filter(p => p.category === filter);

  return (
    <section className="portfolio-section" id="portfolio">
      <div className="container">
        
        {/* Section Header */}
        <motion.div 
          className="section-header"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <div className="section-eyebrow" style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
            <FolderKanban size={18} /> {t('portfolioEyebrow')}
          </div>
          <h2 className="section-title">
            {t('portfolioTitle1')} <span className="gradient-text">{t('portfolioTitle2')}</span>
          </h2>
          <p className="section-desc">
            {t('portfolioDesc')}
          </p>
        </motion.div>

        {/* Filter Pills */}
        <div className="portfolio-filters">
          {categories.map(cat => (
            <button
              key={cat.key}
              className={`portfolio-filter-btn ${filter === cat.key ? 'active' : ''}`}
              onClick={() => setFilter(cat.key)}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Projects Grid */}
        <motion.div className="portfolio-grid" layout>
          <AnimatePresence>
            {filteredProjects.map(project => (
              <motion.div
                key={project.id}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.3 }}
                className="portfolio-card"
              >
                <div className="portfolio-img-wrap">
                  <img src={project.image} alt={project.title} loading="lazy" />
                  <div className="portfolio-badge">{project.badge}</div>
                  <div className="portfolio-category-tag">{project.categoryLabel}</div>
                </div>

                <div className="portfolio-body">
                  <h3 className="portfolio-title">{project.title}</h3>
                  <p className="portfolio-desc">{project.description}</p>
                  
                  <div className="portfolio-tags">
                    {project.tags.map(t => (
                      <span key={t} className="portfolio-tag">{t}</span>
                    ))}
                  </div>

                  <div className="portfolio-footer">
                    <span className="portfolio-stat">⚡ {project.stats}</span>
                    <Link to="/custom-service" className="portfolio-link">
                      {t('portfolioOrderSimilar')} <ArrowLeft size={15} style={{ transform: language === 'en' ? 'rotate(180deg)' : 'none' }} />
                    </Link>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>

        {/* CTA Footer inside Portfolio */}
        <div className="portfolio-cta">
          <div>
            <h3>{t('portfolioCtaTitle')}</h3>
            <p>{t('portfolioCtaDesc')}</p>
          </div>
          <Link to="/custom-service" className="btn-primary" style={{ padding: '12px 28px' }}>
            <Sparkles size={18} /> {t('portfolioCtaBtn')}
          </Link>
        </div>

      </div>
    </section>
  );
}
