// Freskvv Tec EG — Reusable Confirm Modal (replaces window.confirm)
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, Trash2, X } from 'lucide-react';

export default function ConfirmModal({ isOpen, onConfirm, onCancel, title = 'تأكيد الإجراء', message, confirmText = 'تأكيد', cancelText = 'إلغاء', danger = false }) {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div
        style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 99999, padding: 20 }}
        onClick={onCancel}
      >
        <motion.div
          initial={{ scale: 0.85, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.85, opacity: 0, y: 20 }}
          transition={{ type: 'spring', damping: 20, stiffness: 300 }}
          onClick={e => e.stopPropagation()}
          style={{
            background: 'linear-gradient(145deg, var(--bg-secondary), var(--bg-tertiary))',
            border: '1px solid var(--border-glass)',
            borderRadius: 20,
            padding: '32px 28px',
            width: '100%',
            maxWidth: 420,
            boxShadow: '0 30px 80px rgba(0,0,0,0.5)',
            textAlign: 'center',
          }}
        >
          {/* Icon */}
          <div style={{
            width: 68, height: 68,
            borderRadius: '50%',
            background: danger ? 'rgba(239,68,68,0.12)' : 'rgba(79,159,255,0.12)',
            border: `1px solid ${danger ? 'rgba(239,68,68,0.25)' : 'rgba(79,159,255,0.25)'}`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 20px',
          }}>
            {danger
              ? <Trash2 size={28} color="#ef4444" />
              : <AlertTriangle size={28} color="var(--accent-blue)" />
            }
          </div>

          <h3 style={{ fontSize: 18, fontWeight: 800, marginBottom: 10, color: 'var(--text-primary)' }}>{title}</h3>
          {message && <p style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.7, marginBottom: 28 }}>{message}</p>}

          <div style={{ display: 'flex', gap: 12 }}>
            <button
              onClick={onCancel}
              style={{
                flex: 1,
                padding: '11px 0',
                borderRadius: 12,
                border: '1px solid var(--border-glass)',
                background: 'rgba(255,255,255,0.04)',
                color: 'var(--text-secondary)',
                fontSize: 14,
                fontWeight: 600,
                cursor: 'pointer',
                fontFamily: 'var(--font-primary)',
                transition: 'all 0.2s',
              }}
            >
              {cancelText}
            </button>
            <button
              onClick={onConfirm}
              style={{
                flex: 1,
                padding: '11px 0',
                borderRadius: 12,
                border: 'none',
                background: danger
                  ? 'linear-gradient(135deg, #dc2626, #ef4444)'
                  : 'var(--gradient-main)',
                color: 'white',
                fontSize: 14,
                fontWeight: 700,
                cursor: 'pointer',
                fontFamily: 'var(--font-primary)',
                boxShadow: danger ? '0 4px 15px rgba(239,68,68,0.35)' : 'var(--shadow-btn)',
                transition: 'all 0.2s',
              }}
            >
              {confirmText}
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
