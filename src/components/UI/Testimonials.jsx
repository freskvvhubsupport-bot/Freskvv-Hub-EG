import { motion } from 'framer-motion';
import { Star, Quote, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import './Testimonials.css';

const REVIEWS = [
  {
    id: 1,
    name: 'مؤسسة إنجاز',
    role: 'شركة تطوير عقاري',
    content: 'أفضل خدمة لإنشاء وتجهيز سيرفرات قواعد البيانات والتطبيقات. الدعم الفني متواجد دائماً وسرعة الاستجابة ممتازة.',
    rating: 5,
  },
  {
    id: 2,
    name: 'أحمد سعيد',
    role: 'ستريمر وألعاب',
    content: 'سيرفرات ببجي وفايف إم لا يعلى عليها، البينج ممتاز جداً ومافيش أي لاج حتى وقت الذروة.',
    rating: 5,
  },
  {
    id: 3,
    name: 'متجر فكرة',
    role: 'متجر إلكتروني',
    content: 'تم برمجة المتجر بشكل احترافي جداً وفي وقت قياسي. أسعار الباقات مناسبة جداً مقارنة بالجودة.',
    rating: 4,
  },
];

export default function Testimonials() {
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveIndex((current) => (current + 1) % REVIEWS.length);
    }, 6000);
    return () => clearInterval(timer);
  }, []);

  return (
    <section className="testimonials-section">
      <div className="container">
        <motion.div 
          className="section-header"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <div className="section-eyebrow">💬 آراء العملاء</div>
          <h2 className="section-title">
            ماذا يقول <span className="gradient-text">عملاؤنا</span> عنا؟
          </h2>
        </motion.div>

        <div className="testimonials-carousel">
          <div className="testimonials-cards">
            {REVIEWS.map((review, index) => {
              const isActive = index === activeIndex;
              return (
                <motion.div
                  key={review.id}
                  className={`testimonial-card glass-card ${isActive ? 'active' : ''}`}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ 
                    opacity: isActive ? 1 : 0.4, 
                    scale: isActive ? 1 : 0.9,
                    x: `${(index - activeIndex) * 110}%`,
                    zIndex: isActive ? 10 : 1
                  }}
                  transition={{ type: 'spring', stiffness: 100, damping: 20 }}
                >
                  <Quote size={40} className="quote-icon" />
                  <div className="testimonial-rating">
                    {[...Array(review.rating)].map((_, i) => (
                      <Star key={i} size={16} fill="var(--accent-blue)" color="var(--accent-blue)" />
                    ))}
                  </div>
                  <p className="testimonial-content">{review.content}</p>
                  <div className="testimonial-author">
                    <div className="author-avatar">{review.name.charAt(0)}</div>
                    <div>
                      <h4 className="author-name">{review.name}</h4>
                      <span className="author-role">{review.role}</span>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>

          <div className="carousel-dots">
            {REVIEWS.map((_, idx) => (
              <button
                key={idx}
                className={`dot ${idx === activeIndex ? 'active' : ''}`}
                onClick={() => setActiveIndex(idx)}
              />
            ))}
          </div>

          <div style={{ textAlign: 'center', marginTop: 32 }}>
            <Link to="/community" className="btn-ghost" style={{ fontSize: 'var(--font-size-sm)', padding: '10px 24px', display: 'inline-flex', alignItems: 'center', gap: 8 }}>
              عرض جميع التقييمات أو شاركنا رأيك <ArrowLeft size={16} />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
