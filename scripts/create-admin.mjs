// Admin Account Creator — Run once to set up admin user
// Usage: node scripts/create-admin.mjs <YOUR_UID>
// Get UID from Firebase Console > Authentication > Users

import { initializeApp } from 'firebase/app';
import { getFirestore, doc, setDoc, getDoc, updateDoc, serverTimestamp } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyBTkDq1A0Ua8JuJrBu0frVvssZPmxXd21U",
  authDomain: "freskvv-tec-eg.firebaseapp.com",
  projectId: "freskvv-tec-eg",
  storageBucket: "freskvv-tec-eg.firebasestorage.app",
  messagingSenderId: "886458781008",
  appId: "1:886458781008:web:eded1ca8b8131a29367055",
  measurementId: "G-5J37TX3G36"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const uid = process.argv[2];

if (!uid) {
  console.error('❌ Please provide a UID: node scripts/create-admin.mjs <UID>');
  process.exit(1);
}

async function makeAdmin() {
  try {
    const userRef = doc(db, 'users', uid);
    const snap = await getDoc(userRef);
    
    if (snap.exists()) {
      await updateDoc(userRef, { role: 'admin' });
      console.log(`✅ User ${uid} has been granted ADMIN role!`);
    } else {
      // Create a brand new admin user document
      await setDoc(userRef, {
        uid,
        email: 'admin@freskvv.com',
        fullName: 'Freskvv Admin',
        role: 'admin',
        profileComplete: true,
        walletBalance: 0,
        points: 0,
        isNew: false,
        createdAt: serverTimestamp(),
      });
      console.log(`✅ Admin document created for UID: ${uid}`);
    }
    process.exit(0);
  } catch (err) {
    console.error('❌ Error:', err.message);
    process.exit(1);
  }
}

makeAdmin();
