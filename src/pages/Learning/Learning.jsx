// Freskvv Tec EG — Learning & Knowledge Base Page
import { useState } from 'react';
import { BookOpen, Play, Search, Code, Server, Shield, Sparkles, ArrowRight, ChevronLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

const ARTICLES = [
  {
    id: 1,
    category: 'servers',
    categoryLabel: 'سيرفرات الألعاب',
    title: 'كيف تختار مواصفات السيرفر المناسب لمشروعك؟',
    desc: 'دليل شامل لاختيار المعالج (CPU)، الـ RAM، ونوع الـ SSD لضمان أفضل بينج وعدم وجود لاج.',
    time: 'قراءة 5 دقائق',
    level: 'مبتدئ',
    icon: <Server size={22} color="var(--accent-blue-bright)" />
  },
  {
    id: 2,
    category: 'security',
    categoryLabel: 'الأمان والحماية',
    title: 'طرق حماية حسابك ومحفظتك من السرقة والاحتيال',
    desc: 'خطوات هامة لتفعيل التوثيق بخطوتين والحفاظ على سرية سكرينات التحويل والمعلومات الفردية.',
    time: 'قراءة 3 دقائق',
    level: 'مهم جداً ⚠️',
    icon: <Shield size={22} color="#22c55e" />
  },
  {
    id: 3,
    category: 'coding',
    categoryLabel: 'تطوير وبرمجة',
    title: 'كيف تبدأ في برمجة بوتات ديسكورد باستخدام Node.js؟',
    desc: 'خطوات تثبيت المكتبات وتجهيز الـ Token وربط البوت بقاعدة البيانات للتفاعل السريع.',
    time: 'قراءة 8 دقائق',
    level: 'متوسط',
    icon: <Code size={22} color="#8b5cf6" />
  },
  {
    id: 4,
    category: 'servers',
    categoryLabel: 'سيرفرات الألعاب',
    title: 'دليل ربط سيرفر FiveM بقواعد بيانات MySQL',
    desc: 'طريقة إعداد الـ Database وحفظ بيانات اللاعبين والأسلحة والسيارات أوتوماتيكياً.',
    time: 'قراءة 6 دقائق',
    level: 'متوسط',
    icon: <Server size={22} color="var(--accent-blue-bright)" />
  }
];

export default function Learning() {
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  const filtered = ARTICLES.filter(a => {
    const matchCat = selectedCategory === 'all' || a.category === selectedCategory;
    const matchSearch = !search || a.title.toLowerCase().includes(search.toLowerCase()) || a.desc.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  return (
    <div style={{ paddingTop: 110, paddingBottom: 80, minHeight: '100vh' }}>
      <div className="container">
        
        {/* Header */}
        <div style={{ marginBottom: 32 }}>
          <Link to="/" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: 'var(--text-secondary)', textDecoration: 'none', marginBottom: 20, fontSize: 14, background: 'rgba(255,255,255,0.03)', padding: '7px 16px', borderRadius: 99, border: '1px solid var(--border-glass)' }}>
            <ArrowRight size={16} /> العودة للرئيسية
          </Link>
          
          <div style={{ textAlign: 'center', maxWidth: 640, margin: '0 auto 40px' }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(139,92,246,0.1)', border: '1px solid rgba(139,92,246,0.2)', borderRadius: 99, padding: '6px 18px', marginBottom: 16, fontSize: 13, color: 'var(--accent-purple-bright)' }}>
              <BookOpen size={16} /> أكاديمية Freskvv Tec
            </div>
            <h1 style={{ fontSize: '2.5rem', fontWeight: 900, marginBottom: 12 }}>
              مركز المعرفة و<span className="gradient-text">الشروحات التقنية</span>
            </h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: '1rem', lineHeight: 1.7 }}>
              شروحات مبسطة ودروس تعليمية تساعدك في إعداد سيرفرك، برمجة تطبيقاتك، وحماية بياناتك
            </p>
          </div>

          {/* Search bar */}
          <div style={{ maxWidth: 480, margin: '0 auto 28px', position: 'relative' }}>
            <Search size={18} style={{ position: 'absolute', top: '50%', right: 16, transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input
              type="text"
              className="form-input"
              placeholder="ابحث عن درس أو موضوع..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              style={{ paddingRight: 48, width: '100%', fontSize: 15 }}
            />
          </div>

          {/* Category Filter */}
          <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap', marginBottom: 40 }}>
            {[
              { id: 'all', name: '📚 كل الشروحات' },
              { id: 'servers', name: '🎮 سيرفرات الألعاب' },
              { id: 'coding', name: '💻 البرمجة والتطوير' },
              { id: 'security', name: '🛡️ الحماية والأمان' }
            ].map(cat => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                style={{
                  padding: '7px 18px',
                  borderRadius: 99,
                  border: selectedCategory === cat.id ? '1px solid var(--accent-purple)' : '1px solid var(--border-glass)',
                  background: selectedCategory === cat.id ? 'rgba(139,92,246,0.2)' : 'rgba(255,255,255,0.02)',
                  color: selectedCategory === cat.id ? 'var(--accent-purple-bright)' : 'var(--text-secondary)',
                  cursor: 'pointer',
                  fontSize: 13,
                  fontWeight: 700,
                  transition: 'all 0.2s'
                }}
              >
                {cat.name}
              </button>
            ))}
          </div>

          {/* Articles Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 20 }}>
            {filtered.map((item, i) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.08 }}
                style={{
                  background: 'rgba(13,13,34,0.7)',
                  border: '1px solid var(--border-glass)',
                  borderRadius: 20,
                  padding: 24,
                  display: 'flex',
                  flexDirection: 'column',
                  justify: 'space-between',
                  backdropFilter: 'blur(20px)'
                }}
              >
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                    <div style={{ width: 42, height: 42, borderRadius: 12, background: 'rgba(255,255,255,0.03)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      {item.icon}
                    </div>
                    <span style={{ fontSize: 11, background: 'rgba(255,255,255,0.04)', color: 'var(--text-muted)', padding: '3px 10px', borderRadius: 99 }}>
                      {item.level}
                    </span>
                  </div>

                  <span style={{ fontSize: 11, color: 'var(--accent-purple-bright)', fontWeight: 700 }}>{item.categoryLabel}</span>
                  <h3 style={{ fontSize: '1.1rem', fontWeight: 800, margin: '6px 0 10px', color: 'var(--text-primary)' }}>{item.title}</h3>
                  <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: 20 }}>{item.desc}</p>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: 14, borderTop: '1px solid var(--border-glass)' }}>
                  <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>⏱️ {item.time}</span>
                  <button className="btn-ghost" style={{ padding: '6px 14px', fontSize: 12, color: 'var(--accent-blue-bright)' }} onClick={() => alert('سيتوفر الشرح التفصيلي كفيديو قريباً!')}>
                    قراءة الشرح <ChevronLeft size={14} />
                  </button>
                </div>
              </motion.div>
            ))}
          </div>

        </div>

      </div>
    </div>
  );
}
