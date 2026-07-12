import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingBag, Star, Gamepad2, Server } from 'lucide-react';
import './LivePurchaseTicker.css';

const NOTIFICATIONS = [
  { id: 1, name: 'أحمد محمود', item: 'سيرفر ببجي VIP', time: 'منذ دقيقة', icon: <Server size={18} /> },
  { id: 2, name: 'سارة', item: 'شحن 600 UC', time: 'منذ 3 دقائق', icon: <Gamepad2 size={18} /> },
  { id: 3, name: 'كريم', item: 'باقة المتابعين الماسية', time: 'منذ 5 دقائق', icon: <Star size={18} /> },
  { id: 4, name: 'محمد صابر', item: 'سيرفر تيم سبيك', time: 'منذ 10 دقائق', icon: <Server size={18} /> },
  { id: 5, name: 'يوسف', item: 'تطوير موقع شخصي', time: 'منذ 15 دقيقة', icon: <ShoppingBag size={18} /> },
];

export default function LivePurchaseTicker() {
  const [currentNotif, setCurrentNotif] = useState(null);

  useEffect(() => {
    // Show first notification after a delay
    const initialTimer = setTimeout(() => {
      showRandomNotif();
    }, 5000);

    return () => clearTimeout(initialTimer);
  }, []);

  const showRandomNotif = () => {
    const random = NOTIFICATIONS[Math.floor(Math.random() * NOTIFICATIONS.length)];
    setCurrentNotif(random);

    // Hide after 5 seconds
    setTimeout(() => {
      setCurrentNotif(null);
      // Show next one after 10-25 seconds
      const nextDelay = Math.random() * 15000 + 10000;
      setTimeout(showRandomNotif, nextDelay);
    }, 5000);
  };

  return (
    <AnimatePresence>
      {currentNotif && (
        <motion.div
          key={currentNotif.id}
          className="live-ticker-card glass-card"
          initial={{ opacity: 0, y: 50, x: -20 }}
          animate={{ opacity: 1, y: 0, x: 0 }}
          exit={{ opacity: 0, y: 20, scale: 0.9 }}
          transition={{ type: 'spring', stiffness: 200, damping: 20 }}
        >
          <div className="ticker-icon-bg">
            {currentNotif.icon}
          </div>
          <div className="ticker-content">
            <div className="ticker-header">
              <span className="ticker-name">{currentNotif.name}</span>
              <span className="ticker-time">{currentNotif.time}</span>
            </div>
            <div className="ticker-item">
              قام بشراء <span className="ticker-highlight">{currentNotif.item}</span>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
