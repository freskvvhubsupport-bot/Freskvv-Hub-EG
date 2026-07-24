import React from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle, RefreshCw, ArrowRight } from 'lucide-react';

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    // If it's a dynamic import failure (new deployment uploaded to Vercel while tab was open)
    const isChunkError = error?.message?.includes('Failed to fetch dynamically imported module') ||
                         error?.message?.includes('Importing a module script failed') ||
                         error?.name === 'ChunkLoadError';
                         
    if (isChunkError && !sessionStorage.getItem('chunk_reload_attempted')) {
      sessionStorage.setItem('chunk_reload_attempted', 'true');
      window.location.reload();
      return { hasError: false, error: null };
    }
    
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("ErrorBoundary caught an error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      const errMsg = this.state.error?.message || 'خطأ غير معروف';
      return (
        <div style={{
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'var(--bg-primary)',
          color: 'var(--text-primary)',
          padding: '20px',
          textAlign: 'center'
        }}>
          <motion.div 
            initial={{ scale: 0.8, opacity: 0 }} 
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring' }}
            style={{
              background: 'var(--bg-card)',
              border: '1px solid var(--border-glass)',
              borderRadius: '24px',
              padding: '40px',
              maxWidth: '560px',
              width: '100%',
              boxShadow: 'var(--shadow-card)'
            }}
          >
            <div style={{ color: 'var(--accent-red, #f87171)', marginBottom: '20px' }}>
              <AlertTriangle size={64} style={{ margin: '0 auto' }} />
            </div>
            <h1 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '16px' }}>
              عذراً، حدث خطأ غير متوقع!
            </h1>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '16px', lineHeight: '1.6' }}>
              لقد واجه النظام مشكلة أثناء معالجة طلبك. لقد تم تسجيل هذا الخطأ ليتعامل معه فريق الدعم الفني.
            </p>
            {/* Show actual error for debugging */}
            <div style={{
              background: 'rgba(248,113,113,0.08)',
              border: '1px solid rgba(248,113,113,0.2)',
              borderRadius: 12,
              padding: '12px 16px',
              marginBottom: '28px',
              textAlign: 'left',
              direction: 'ltr',
              fontFamily: 'monospace',
              fontSize: 12,
              color: '#f87171',
              wordBreak: 'break-all',
              maxHeight: 100,
              overflowY: 'auto',
            }}>
              {errMsg}
            </div>
            <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
              <button 
                onClick={() => { this.setState({ hasError: false, error: null }); window.history.back(); }}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  background: 'rgba(255,255,255,0.06)',
                  color: 'var(--text-primary)',
                  border: '1px solid var(--border-glass)',
                  padding: '12px 24px',
                  borderRadius: '99px',
                  fontSize: '15px',
                  fontWeight: 'bold',
                  cursor: 'pointer'
                }}
              >
                <ArrowRight size={16} />
                رجوع
              </button>
              <button 
                onClick={() => window.location.reload()}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  background: 'var(--gradient-main)',
                  color: 'white',
                  border: 'none',
                  padding: '12px 24px',
                  borderRadius: '99px',
                  fontSize: '15px',
                  fontWeight: 'bold',
                  cursor: 'pointer'
                }}
              >
                <RefreshCw size={16} />
                تحديث الصفحة
              </button>
            </div>
          </motion.div>
        </div>
      );
    }

    return this.props.children;
  }
}
