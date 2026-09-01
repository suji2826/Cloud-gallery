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
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || 'AIzaSyBX2LZkYNnJB_mFawfcEsodISy7j8uySV8',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || 'cloudgallery-387880832940.firebaseapp.com',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || 'cloudgallery-387880832940',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || 'cloudgallery-387880832940.appspot.com',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '387880832940',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || '1:387880832940:web:cloudgallery',
};

// Initialize Firebase App singleton instance (Structure: initializeApp(firebaseConfig))
export const firebaseApp = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);

// Initialize Firebase Authentication using the centralized app instance (Structure: getAuth(firebaseApp))
export const auth = getAuth(firebaseApp);

// Configure local session persistence
setPersistence(auth, browserLocalPersistence).catch((err) => {
  console.warn('Firebase persistence warning:', err);
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

