// Freskvv Tec EG — Auth Context
import { createContext, useContext, useState, useEffect } from 'react';
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  signOut,
  sendEmailVerification,
} from 'firebase/auth';
import { doc, getDoc, setDoc, onSnapshot, serverTimestamp } from 'firebase/firestore';
import { auth, googleProvider, db } from '../firebase/config';

const AuthContext = createContext(null);

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
};

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  const fetchUserProfile = async (uid) => {
    try {
      const snap = await getDoc(doc(db, 'users', uid));
      if (snap.exists()) {
        const data = snap.data();
        setUserProfile(data);
        setIsAdmin(data.role === 'admin');
        return data;
      }
      return null;
    } catch (err) {
      console.error('Error fetching user profile:', err);
      return null;
    }
  };

  useEffect(() => {
    let unsubProfile = null;
    const unsubAuth = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      if (user) {
        // Listen to user profile changes in real-time
        unsubProfile = onSnapshot(doc(db, 'users', user.uid), (snap) => {
          if (snap.exists()) {
            const data = snap.data();
            setUserProfile(data);
            setIsAdmin(data.role === 'admin');
          } else {
            setUserProfile(null);
            setIsAdmin(false);
          }
          setLoading(false);
        }, (error) => {
          console.error('Error fetching user profile:', error);
          setLoading(false);
        });
      } else {
        setUserProfile(null);
        setIsAdmin(false);
        setLoading(false);
        if (unsubProfile) unsubProfile();
      }
    });
    return () => {
      unsubAuth();
      if (unsubProfile) unsubProfile();
    };
  }, []);

  const login = (email, password) =>
    signInWithEmailAndPassword(auth, email, password);

  const register = (email, password) =>
    createUserWithEmailAndPassword(auth, email, password);

  const loginWithGoogle = () => signInWithPopup(auth, googleProvider);

  const logout = () => signOut(auth);

  const sendVerificationEmail = () =>
    auth.currentUser && sendEmailVerification(auth.currentUser);

  const createUserDocument = async (uid, data) => {
    const userRef = doc(db, 'users', uid);
    const snap = await getDoc(userRef);
    if (!snap.exists()) {
      await setDoc(userRef, {
        uid,
        ...data,
        role: 'user',
        isNew: true,
        walletBalance: 0,
        points: 0,
        createdAt: serverTimestamp(),
        lastSeen: serverTimestamp(),
      });
      // Create wallet sub-document
      await setDoc(doc(db, 'wallets', uid), {
        uid,
        balance: 0,
        totalDeposited: 0,
        totalSpent: 0,
        createdAt: serverTimestamp(),
      });
    }
    return fetchUserProfile(uid);
  };

  const value = {
    currentUser,
    userProfile,
    isAdmin,
    loading,
    login,
    register,
    loginWithGoogle,
    logout,
    sendVerificationEmail,
    createUserDocument,
    fetchUserProfile,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}
