import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  updateProfile,
  onAuthStateChanged,
  User as FirebaseUser,
  setPersistence,
  browserLocalPersistence,
} from 'firebase/auth';

/**
 * Firebase Client Configuration Layer
 * Centralized Firebase App & Authentication setup for CloudGallery
 */

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || 'AIzaSyA_DEMO_KEY_CLOUDGALLERY_2026',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || 'cloudgallery-auth.firebaseapp.com',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || 'cloudgallery-auth',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || 'cloudgallery-auth.appspot.com',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '109283746501',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || '1:109283746501:web:a1b2c3d4e5f6g7h8i9j0k1',
};

// Initialize Firebase App singleton
export const firebaseApp = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);

// Initialize Firebase Authentication
export const auth = getAuth(firebaseApp);

// Configure local persistence
setPersistence(auth, browserLocalPersistence).catch((err) => {
  console.warn('Firebase persistence setup warning:', err);
});

export {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  updateProfile,
  onAuthStateChanged,
};
export type { FirebaseUser };
