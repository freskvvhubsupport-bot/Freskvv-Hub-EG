// Freskvv Tec EG — Settings Context
import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase/config';
import { useAuth } from './AuthContext';

const SettingsContext = createContext(null);

export const useSettings = () => {
  const ctx = useContext(SettingsContext);
  if (!ctx) throw new Error('useSettings must be used inside SettingsProvider');
  return ctx;
};

export function SettingsProvider({ children }) {
  const [settings, setSettings] = useState({ maintenanceMode: false, siteNotice: '' });
  const [loading, setLoading] = useState(true);
  
  // Theme & Language State
  const [theme, setTheme] = useState(localStorage.getItem('freskvv_theme') || 'midnight');
  const [language, setLanguage] = useState(localStorage.getItem('freskvv_lang') || 'ar');
  const { isAdmin } = useAuth();

  useEffect(() => {
    // Apply Theme
    document.body.setAttribute('data-theme', theme);
    localStorage.setItem('freskvv_theme', theme);
  }, [theme]);

  useEffect(() => {
    // Apply Language and Direction
    document.documentElement.dir = language === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = language;
    localStorage.setItem('freskvv_lang', language);
  }, [language]);

  const toggleTheme = useCallback(() => {
    setTheme(prev => {
      if (prev === 'midnight') return 'light';
      if (prev === 'light') return 'neon';
      return 'midnight';
    });
  }, []);

  const changeLanguage = useCallback((lang) => {
    setLanguage(lang);
  }, []);

  useEffect(() => {
    const safetyTimer = setTimeout(() => {
      setLoading(false);
    }, 3500);

    const unsub = onSnapshot(doc(db, 'settings', 'general'), (docSnap) => {
      clearTimeout(safetyTimer);
      if (docSnap.exists()) {
        setSettings(docSnap.data());
      }
      setLoading(false);
    }, (error) => {
      clearTimeout(safetyTimer);
      console.error("Error fetching settings:", error);
      setLoading(false);
    });

    return () => {
      clearTimeout(safetyTimer);
      unsub();
    };
  }, []);

  // Maintenance screen logic
  if (!loading && settings.maintenanceMode && !isAdmin) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', background: 'var(--bg-base)', color: 'var(--text-primary)', textAlign: 'center', padding: 'var(--space-6)' }}>
        <div style={{ fontSize: '64px', marginBottom: 'var(--space-4)' }}>🚧</div>
        <h1 style={{ fontFamily: 'var(--font-primary)', marginBottom: 'var(--space-4)', color: 'var(--accent-orange)' }}>الموقع في وضع الصيانة</h1>
        <p style={{ color: 'var(--text-secondary)', maxWidth: '500px', lineHeight: '1.8' }}>
          نحن نقوم حالياً ببعض التحديثات الهامة لتحسين تجربتكم. سنعود للعمل قريباً جداً، نشكركم على تفهمكم!
        </p>
      </div>
    );
  }

  return (
    <SettingsContext.Provider value={{ 
      settings, 
      loading, 
      theme, 
      toggleTheme, 
      language, 
      changeLanguage 
    }}>
      {loading ? (
        <div style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'var(--bg-primary, #0a0a1a)',
        }}>
          <div style={{
            width: 48,
            height: 48,
            borderRadius: '50%',
            border: '3px solid rgba(79,159,255,0.2)',
            borderTop: '3px solid #4f9fff',
            animation: 'spin 0.7s linear infinite',
          }} />
        </div>
      ) : children}
    </SettingsContext.Provider>
  );
}
