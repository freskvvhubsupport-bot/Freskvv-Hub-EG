// Freskvv Tec EG — Firebase Configuration
// TODO: Replace with your actual Firebase project config from console.firebase.google.com

import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { getMessaging, isSupported } from 'firebase/messaging';

// ⚠️ استبدل هذه البيانات ببيانات مشروعك من Firebase Console
const firebaseConfig = {
  apiKey: "AIzaSyBTkDq1A0Ua8JuJrBu0frVvssZPmxXd21U",
  authDomain: "freskvv-tec-eg.firebaseapp.com",
  projectId: "freskvv-tec-eg",
  storageBucket: "freskvv-tec-eg.firebasestorage.app",
  messagingSenderId: "886458781008",
  appId: "1:886458781008:web:eded1ca8b8131a29367055",
  measurementId: "G-5J37TX3G36"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Auth
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: 'select_account' });

// Firestore
export const db = getFirestore(app);

// Storage
export const storage = getStorage(app);

// Messaging (optional — browser support check)
export const getMessagingInstance = async () => {
  try {
    const supported = await isSupported();
    if (supported) {
      return getMessaging(app);
    }
    return null;
  } catch {
    return null;
  }
};

export default app;
