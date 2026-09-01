import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInAnonymously,
  signOut,
  onAuthStateChanged,
  User as FirebaseUser,
  setPersistence,
  browserLocalPersistence,
  Auth,
} from 'firebase/auth';

/**
 * Firebase Web App Configuration
 * Reads from Vite environment variables (VITE_FIREBASE_*) with default configuration for gallery-881c6.
 */
export const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || 'AIzaSyAJx4D-a589EoM9yhi-COIEuXhTVgOOSe0',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || 'gallery-881c6.firebaseapp.com',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || 'gallery-881c6',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || 'gallery-881c6.firebasestorage.app',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '313209083062',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || '1:313209083062:web:67e78be129612f62240217',
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || 'G-JHBCPV5YCD',
};

/**
 * Validate configuration completeness and return any missing variable names
 */
export const getMissingFirebaseConfigKeys = (): string[] => {
  const missing: string[] = [];
  if (!firebaseConfig.apiKey) missing.push('VITE_FIREBASE_API_KEY');
  if (!firebaseConfig.authDomain) missing.push('VITE_FIREBASE_AUTH_DOMAIN');
  if (!firebaseConfig.projectId) missing.push('VITE_FIREBASE_PROJECT_ID');
  if (!firebaseConfig.storageBucket) missing.push('VITE_FIREBASE_STORAGE_BUCKET');
  if (!firebaseConfig.messagingSenderId) missing.push('VITE_FIREBASE_MESSAGING_SENDER_ID');
  if (!firebaseConfig.appId) missing.push('VITE_FIREBASE_APP_ID');
  return missing;
};

/**
 * Check if the Firebase configuration is present and valid
 */
export const isFirebaseConfigured = (): boolean => {
  return getMissingFirebaseConfigKeys().length === 0;
};

let appInstance: FirebaseApp;
let authInstance: Auth;

// Initialize Firebase App instance singleton once
if (getApps().length > 0) {
  appInstance = getApp();
  authInstance = getAuth(appInstance);
} else {
  appInstance = initializeApp(firebaseConfig);
  authInstance = getAuth(appInstance);
  // Configure local session persistence
  setPersistence(authInstance, browserLocalPersistence).catch((err) => {
    if (import.meta.env.DEV) {
      console.warn('Firebase session persistence notice:', err);
    }
  });
}

export const firebaseApp = appInstance;
export const auth = authInstance;

// Google Authentication Provider setup
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({
  prompt: 'select_account',
});

export {
  GoogleAuthProvider,
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInAnonymously,
  signOut,
  onAuthStateChanged,
};
export type { FirebaseUser };
