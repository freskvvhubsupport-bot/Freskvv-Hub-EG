import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

const resources = {
  ar: {
    translation: {
      "home": "الرئيسية",
      "services": "الخدمات",
      "game_store": "متجر الألعاب",
      "custom_service": "طلب خدمة مخصصة",
      "learning": "المنصة التعليمية",
      "login": "تسجيل الدخول",
      "create_account": "إنشاء حساب مجاني",
      "dashboard": "لوحة التحكم",
      "logout": "تسجيل الخروج",
      "verified_site": "موقع موثق",
      "language": "English",
      "switch_lang": "en"
    }
  },
  en: {
    translation: {
      "home": "Home",
      "services": "Services",
      "game_store": "Game Store",
      "custom_service": "Custom Request",
      "learning": "Learning",
      "login": "Login",
      "create_account": "Sign Up Free",
      "dashboard": "Dashboard",
      "logout": "Logout",
      "verified_site": "Verified Site",
      "language": "العربية",
      "switch_lang": "ar"
    }
  }
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: "ar", // Default language
    fallbackLng: "ar",
    interpolation: {
      escapeValue: false
    }
  });

export default i18n;
