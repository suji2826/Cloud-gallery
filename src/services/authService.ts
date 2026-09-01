import {
  auth,
  googleProvider,
  signInWithPopup,
  signOut,
  onAuthStateChanged,
  isFirebaseConfigured,
  FirebaseUser,
} from '../lib/firebase';
import { User } from '../types';

export interface AuthResponse {
  user: User;
  token: string;
}

export const TOKEN_STORAGE_KEY = 'cloudgallery_firebase_token';
export const USER_STORAGE_KEY = 'cloudgallery_firebase_user';

export function mapFirebaseUser(fbUser: FirebaseUser): User {
  return {
    id: fbUser.uid,
    email: fbUser.email || '',
    name: fbUser.displayName || fbUser.email?.split('@')[0] || 'Cloud User',
    createdAt: fbUser.metadata?.creationTime || new Date().toISOString(),
    avatarUrl: fbUser.photoURL || undefined,
  };
}

class AuthService {
  private currentToken: string | null = null;

  constructor() {
    this.currentToken =
      localStorage.getItem(TOKEN_STORAGE_KEY) || sessionStorage.getItem(TOKEN_STORAGE_KEY);
  }

  /**
   * Primary Authentication: Google Sign-In via Firebase Popup
   */
  async signInWithGoogle(): Promise<AuthResponse> {
    if (!isFirebaseConfigured() || !auth) {
      throw new Error('Authentication configuration is incomplete.');
    }

    try {
      const userCredential = await signInWithPopup(auth, googleProvider);
      const fbUser = userCredential.user;
      const token = await fbUser.getIdToken(true);
      const user = mapFirebaseUser(fbUser);

      this.saveSession(token, user);
      return { user, token };
    } catch (err: any) {
      if (import.meta.env.DEV) {
        console.error('Firebase Google Sign-In error details:', err);
      }
      throw new Error(this.formatFirebaseError(err));
    }
  }

  /**
   * Firebase Sign Out
   */
  async logout(): Promise<void> {
    try {
      if (auth) {
        await signOut(auth);
      }
    } catch (err) {
      if (import.meta.env.DEV) {
        console.warn('Firebase signOut note:', err);
      }
    } finally {
      this.clearSession();
    }
  }

  /**
   * Get fresh Firebase ID Token for AWS API Authorization header
   */
  async getIdToken(forceRefresh = false): Promise<string | null> {
    if (auth && auth.currentUser) {
      try {
        const token = await auth.currentUser.getIdToken(forceRefresh);
        this.currentToken = token;
        localStorage.setItem(TOKEN_STORAGE_KEY, token);
        return token;
      } catch (err) {
        if (import.meta.env.DEV) {
          console.warn('Failed to refresh Firebase ID token:', err);
        }
      }
    }
    return (
      this.currentToken ||
      localStorage.getItem(TOKEN_STORAGE_KEY) ||
      sessionStorage.getItem(TOKEN_STORAGE_KEY)
    );
  }

  /**
   * Listen to Firebase Auth state changes
   */
  onAuthStateChange(callback: (user: User | null) => void): () => void {
    if (!auth) {
      const stored = this.getStoredUser();
      callback(stored);
      return () => {};
    }

    return onAuthStateChanged(auth, async (fbUser) => {
      if (fbUser) {
        try {
          const token = await fbUser.getIdToken();
          const mapped = mapFirebaseUser(fbUser);
          this.saveSession(token, mapped);
          callback(mapped);
        } catch {
          callback(null);
        }
      } else {
        this.clearSession();
        callback(null);
      }
    });
  }

  getStoredUser(): User | null {
    const stored =
      localStorage.getItem(USER_STORAGE_KEY) || sessionStorage.getItem(USER_STORAGE_KEY);
    if (!stored) return null;
    try {
      return JSON.parse(stored);
    } catch {
      return null;
    }
  }

  private saveSession(token: string, user: User): void {
    this.currentToken = token;
    localStorage.setItem(TOKEN_STORAGE_KEY, token);
    localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user));
  }

  private clearSession(): void {
    this.currentToken = null;
    localStorage.removeItem(TOKEN_STORAGE_KEY);
    localStorage.removeItem(USER_STORAGE_KEY);
    sessionStorage.removeItem(TOKEN_STORAGE_KEY);
    sessionStorage.removeItem(USER_STORAGE_KEY);
  }

  private formatFirebaseError(err: any): string {
    const code = err?.code || '';
    const msg = (err?.message || '').toLowerCase();

    if (code === 'auth/popup-closed-by-user' || code === 'auth/cancelled-popup-request') {
      return 'Sign-in was cancelled.';
    }

    if (code === 'auth/popup-blocked') {
      return 'Please allow popups for Google Sign-In.';
    }

    if (
      code === 'auth/api-key-not-valid' ||
      code === 'auth/invalid-api-key' ||
      code === 'auth/invalid-app-credential' ||
      code === 'auth/configuration-not-found' ||
      msg.includes('api-key-not-valid') ||
      msg.includes('api key not valid') ||
      msg.includes('invalid api key')
    ) {
      return 'Authentication configuration is incomplete.';
    }

    if (code === 'auth/unauthorized-domain' || msg.includes('unauthorized-domain')) {
      return 'This domain is not authorized in Firebase Console. Please add it under Authentication > Settings > Authorized domains.';
    }

    if (code === 'auth/operation-not-allowed' || msg.includes('operation-not-allowed')) {
      return 'Google Sign-In is not enabled in the Firebase Console. Please enable Google under Authentication > Sign-in method.';
    }

    if (code === 'auth/network-request-failed' || msg.includes('network')) {
      return 'Network connection failed. Please check your internet connection.';
    }

    return 'Unable to sign in. Please try again.';
  }
}

export const authService = new AuthService();
