// Freskvv Tec EG — New Feature Toast Notification Component
// Auto-shows when new features are available, with "Try Now" buttons
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Sparkles, ArrowLeft, ArrowRight } from 'lucide-react';
import { isNew, FEATURE_REGISTRY } from '../../utils/newBadge';
import { useSettings } from '../../contexts/SettingsContext';
import { getTranslation } from '../../utils/translations';
import './NewFeatureToast.css';

const TOAST_STORAGE_KEY = 'freskvv_dismissed_features';

// Features to show in the toast (user-facing only, not admin)
const USER_FEATURES = [
  { id: 'portfolio', emoji: '🎨', path: '/services' },
  { id: 'custom-service', emoji: '📝', path: '/custom-service' },
  { id: 'game-store', emoji: '🎮', path: '/game-store' },
  { id: 'points', emoji: '⭐', path: '/dashboard/points' },
  { id: 'support-chat', emoji: '💬', path: '/dashboard/support' },
  { id: 'community', emoji: '👥', path: '/community' },
  { id: 'learning', emoji: '📚', path: '/learning' },
];

export default function NewFeatureToast() {
  const [visible, setVisible] = useState(false);
  const [newFeatures, setNewFeatures] = useState([]);
  const { language } = useSettings();
  const isAr = language === 'ar';
  const t = (key) => getTranslation(language, key);

  useEffect(() => {
    // Get dismissed feature IDs from localStorage
    let dismissed = [];
    try {
      dismissed = JSON.parse(localStorage.getItem(TOAST_STORAGE_KEY) || '[]');
    } catch { dismissed = []; }

    // Find features that are new AND not yet dismissed
    const activeNew = USER_FEATURES.filter(uf => {
      const reg = FEATURE_REGISTRY.find(f => f.id === uf.id);
      if (!reg) return false;
      if (dismissed.includes(uf.id)) return false;
      return isNew(reg.addedAt);
    }).map(uf => {
      const reg = FEATURE_REGISTRY.find(f => f.id === uf.id);
      return {
        ...uf,
        name: isAr ? reg.labelAr : reg.labelEn,
      };
    });

    if (activeNew.length > 0) {
      // Delay showing the toast for a smoother UX
      const timer = setTimeout(() => {
        setNewFeatures(activeNew);
        setVisible(true);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [isAr]);

  const handleDismiss = () => {
    setVisible(false);
    // Save dismissed feature IDs
    const ids = newFeatures.map(f => f.id);
    try {
      const existing = JSON.parse(localStorage.getItem(TOAST_STORAGE_KEY) || '[]');
      const merged = [...new Set([...existing, ...ids])];
      localStorage.setItem(TOAST_STORAGE_KEY, JSON.stringify(merged));
    } catch { /* ignore */ }
  };

  const handleTryClick = (featureId) => {
    // Mark this specific feature as seen
    try {
      const existing = JSON.parse(localStorage.getItem(TOAST_STORAGE_KEY) || '[]');
      if (!existing.includes(featureId)) {
        existing.push(featureId);
        localStorage.setItem(TOAST_STORAGE_KEY, JSON.stringify(existing));
      }
    } catch { /* ignore */ }
  };

  return (
    <AnimatePresence>
      {visible && newFeatures.length > 0 && (
        <motion.div
          className="new-feature-toast-overlay"
          initial={{ opacity: 0, y: 80, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 80, scale: 0.95 }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        >
          <div className="new-feature-toast">
            {/* Header */}
            <div className="nft-header">
              <div className="nft-header-left">
                <div className="nft-header-icon">
                  <Sparkles size={18} color="white" />
                </div>
                <div className="nft-header-text">
                  <h3>{t('toastTitle')}</h3>
                  <p>{t('toastSubtitle')}</p>
                </div>
              </div>
              <button className="nft-close-btn" onClick={handleDismiss} aria-label="Close">
                <X size={14} />
              </button>
            </div>

            {/* Features List */}
            <div className="nft-features-list">
              {newFeatures.map((feature) => (
                <div key={feature.id} className="nft-feature-item">
                  <div className="nft-feature-info">
                    <span className="nft-feature-emoji">{feature.emoji}</span>
                    <span className="nft-feature-name">{feature.name}</span>
                  </div>
                  <Link
                    to={feature.path}
                    className="nft-try-btn"
                    onClick={() => { handleTryClick(feature.id); handleDismiss(); }}
                  >
                    {t('toastTryNow')} {isAr ? <ArrowLeft size={12} /> : <ArrowRight size={12} />}
                  </Link>
                </div>
              ))}
            </div>

            {/* Footer */}
            <div className="nft-footer">
              <button className="nft-dismiss-btn" onClick={handleDismiss}>
                {t('toastDismiss')}
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
