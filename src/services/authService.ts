import {
  auth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  updateProfile,
  onAuthStateChanged,
  FirebaseUser,
} from '../lib/firebase';
import { User } from '../types';

export interface SignUpParams {
  name: string;
  email: string;
  password: string;
}

export interface LoginParams {
  email: string;
  password: string;
  rememberMe?: boolean;
}

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
    this.currentToken = localStorage.getItem(TOKEN_STORAGE_KEY) || sessionStorage.getItem(TOKEN_STORAGE_KEY);
  }

  /**
   * Firebase Email/Password Sign Up
   */
  async signUp(params: SignUpParams): Promise<AuthResponse> {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, params.email, params.password);
      
      if (params.name && userCredential.user) {
        await updateProfile(userCredential.user, { displayName: params.name });
      }

      const token = await userCredential.user.getIdToken(true);
      const user = mapFirebaseUser(userCredential.user);
      
      this.saveSession(token, user, true);
      return { user, token };
    } catch (err: any) {
      throw new Error(this.formatFirebaseError(err));
    }
  }

  /**
   * Firebase Email/Password Login
   */
  async login(params: LoginParams): Promise<AuthResponse> {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, params.email, params.password);
      const token = await userCredential.user.getIdToken(true);
      const user = mapFirebaseUser(userCredential.user);
      
      this.saveSession(token, user, params.rememberMe ?? true);
      return { user, token };
    } catch (err: any) {
      throw new Error(this.formatFirebaseError(err));
    }
  }

  /**
   * Firebase Password Reset
   */
  async sendPasswordReset(email: string): Promise<void> {
    try {
      await sendPasswordResetEmail(auth, email);
    } catch (err: any) {
      throw new Error(this.formatFirebaseError(err));
    }
  }

  /**
   * Firebase Sign Out
   */
  async logout(): Promise<void> {
    try {
      await signOut(auth);
    } catch (err) {
      console.warn('Firebase signOut warning:', err);
    } finally {
      this.clearSession();
    }
  }

  /**
   * Get fresh Firebase ID Token
   */
  async getIdToken(forceRefresh = false): Promise<string | null> {
    if (auth.currentUser) {
      try {
        const token = await auth.currentUser.getIdToken(forceRefresh);
        this.currentToken = token;
        localStorage.setItem(TOKEN_STORAGE_KEY, token);
        return token;
      } catch (err) {
        console.warn('Failed to refresh Firebase ID token:', err);
      }
    }
    return this.currentToken || localStorage.getItem(TOKEN_STORAGE_KEY) || sessionStorage.getItem(TOKEN_STORAGE_KEY);
  }

  /**
   * Listen to Firebase Auth state changes
   */
  onAuthStateChange(callback: (user: User | null) => void): () => void {
    return onAuthStateChanged(auth, async (fbUser) => {
      if (fbUser) {
        try {
          const token = await fbUser.getIdToken();
          const mapped = mapFirebaseUser(fbUser);
          this.saveSession(token, mapped, true);
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
    const stored = localStorage.getItem(USER_STORAGE_KEY) || sessionStorage.getItem(USER_STORAGE_KEY);
    if (!stored) return null;
    try {
      return JSON.parse(stored);
    } catch {
      return null;
    }
  }

  private saveSession(token: string, user: User, remember: boolean): void {
    this.currentToken = token;
    const storage = remember ? localStorage : sessionStorage;
    storage.setItem(TOKEN_STORAGE_KEY, token);
    storage.setItem(USER_STORAGE_KEY, JSON.stringify(user));
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
    switch (code) {
      case 'auth/email-already-in-use':
        return 'This email address is already registered. Please sign in instead.';
      case 'auth/invalid-email':
        return 'Please enter a valid email address.';
      case 'auth/user-not-found':
      case 'auth/wrong-password':
      case 'auth/invalid-credential':
        return 'Invalid email or password. Please try again.';
      case 'auth/weak-password':
        return 'Password is too weak. Must be at least 6 characters.';
      case 'auth/too-many-requests':
        return 'Too many failed attempts. Please wait a moment and try again.';
      case 'auth/network-request-failed':
        return 'Network connection failed. Please check your internet connection.';
      default:
        return err?.message || 'Authentication operation failed. Please try again.';
    }
  }
}

export const authService = new AuthService();

