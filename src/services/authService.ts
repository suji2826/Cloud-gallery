import { User } from '../types';
import { apiRequest, TOKEN_STORAGE_KEY, USER_STORAGE_KEY } from './apiService';

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
  refreshToken?: string;
  expiresIn?: number;
}

class AuthService {
  async signUp(params: SignUpParams): Promise<AuthResponse> {
    const data = await apiRequest<AuthResponse>('/auth/signup', {
      method: 'POST',
      body: JSON.stringify(params),
    });

    this.saveSession(data.token, data.user, true);
    return data;
  }

  async login(params: LoginParams): Promise<AuthResponse> {
    const data = await apiRequest<AuthResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(params),
    });

    this.saveSession(data.token, data.user, params.rememberMe ?? true);
    return data;
  }

  async getCurrentUser(): Promise<User | null> {
    const token = this.getToken();
    if (!token) return null;

    try {
      const data = await apiRequest<{ user: User }>('/auth/me');
      if (data?.user) {
        localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(data.user));
        return data.user;
      }
      return null;
    } catch {
      // If token expired or invalid, clear session
      this.logout();
      return null;
    }
  }

  logout(): void {
    localStorage.removeItem(TOKEN_STORAGE_KEY);
    localStorage.removeItem(USER_STORAGE_KEY);
    sessionStorage.removeItem(TOKEN_STORAGE_KEY);
    sessionStorage.removeItem(USER_STORAGE_KEY);
    
    // Fire background logout request
    apiRequest('/auth/logout', { method: 'POST' }).catch(() => {});
  }

  getToken(): string | null {
    return localStorage.getItem(TOKEN_STORAGE_KEY) || sessionStorage.getItem(TOKEN_STORAGE_KEY);
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
    const storage = remember ? localStorage : sessionStorage;
    storage.setItem(TOKEN_STORAGE_KEY, token);
    storage.setItem(USER_STORAGE_KEY, JSON.stringify(user));
  }
}

export const authService = new AuthService();
