import {
  auth,
  googleProvider,
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
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

export interface AuthErrorDetails {
  message: string;
  code?: string;
  isDomainError?: boolean;
  isPopupBlocked?: boolean;
  isOperationNotAllowed?: boolean;
  suggestedDomain?: string;
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
      throw new Error('Firebase configuration is incomplete. Please check your environment variables.');
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
        console.error('Firebase Google Sign-In error:', err);
      }
      const parsedError = this.parseFirebaseError(err);
      const customErr: any = new Error(parsedError.message);
      customErr.details = parsedError;
      throw customErr;
    }
  }

  /**
   * Alternative: Sign In with Email & Password
   */
  async signInWithEmail(email: string, pass: string): Promise<AuthResponse> {
    if (!auth) throw new Error('Firebase is not initialized.');
    try {
      const cred = await signInWithEmailAndPassword(auth, email, pass);
      const token = await cred.user.getIdToken();
      const user = mapFirebaseUser(cred.user);
      this.saveSession(token, user);
      return { user, token };
    } catch (err: any) {
      const parsed = this.parseFirebaseError(err);
      throw new Error(parsed.message);
    }
  }

  /**
   * Quick Demo / Guest Access for instant preview testing
   */
  async signInWithDemo(demoName = 'Test User'): Promise<AuthResponse> {
    const demoUser: User = {
      id: 'demo-user-' + Math.random().toString(36).substring(2, 9),
      email: 'demo@cloudgallery.internal',
      name: demoName,
      createdAt: new Date().toISOString(),
      avatarUrl: `https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80`,
    };
    const mockToken = 'mock-firebase-token-' + Date.now();
    this.saveSession(mockToken, demoUser);
    return { user: demoUser, token: mockToken };
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
        const stored = this.getStoredUser();
        // If demo session is stored, preserve it
        if (stored && stored.id.startsWith('demo-user-')) {
          callback(stored);
        } else {
          this.clearSession();
          callback(null);
        }
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

  parseFirebaseError(err: any): AuthErrorDetails {
    const code = err?.code || '';
    const msg = (err?.message || '').toLowerCase();
    const currentDomain = typeof window !== 'undefined' ? window.location.hostname : '';

    if (code === 'auth/popup-closed-by-user' || code === 'auth/cancelled-popup-request') {
      return {
        message: 'Google Sign-In popup was closed before completing.',
        code,
      };
    }

    if (code === 'auth/popup-blocked') {
      return {
        message: 'Popup window was blocked by the browser. Please allow popups or open the app in a new tab.',
        code,
        isPopupBlocked: true,
      };
    }

    if (code === 'auth/unauthorized-domain' || msg.includes('unauthorized-domain') || msg.includes('unauthorized domain')) {
      return {
        message: `Domain '${currentDomain}' is not authorized in your Firebase Console.`,
        code: 'auth/unauthorized-domain',
        isDomainError: true,
        suggestedDomain: currentDomain,
      };
    }

    if (code === 'auth/operation-not-allowed' || msg.includes('operation-not-allowed')) {
      return {
        message: 'Google Sign-In is not enabled in Firebase Console. Go to Authentication > Sign-in method and enable Google.',
        code: 'auth/operation-not-allowed',
        isOperationNotAllowed: true,
      };
    }

    if (
      code === 'auth/api-key-not-valid' ||
      code === 'auth/invalid-api-key' ||
      code === 'auth/invalid-app-credential' ||
      code === 'auth/configuration-not-found' ||
      msg.includes('api-key-not-valid') ||
      msg.includes('invalid api key')
    ) {
      return {
        message: 'Firebase API Key is invalid or not found. Please verify your Firebase project credentials.',
        code,
      };
    }

    if (code === 'auth/network-request-failed' || msg.includes('network')) {
      return {
        message: 'Network error connecting to Firebase. Please check your internet connection.',
        code,
      };
    }

    return {
      message: err?.message || 'Failed to authenticate with Google. Please try again.',
      code,
    };
  }
}

export const authService = new AuthService();
