import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';

export interface AuthUser {
  id: number;
  name: string;
  email: string;
  avatar: string | null;
  role: 'admin' | 'formateur' | 'apprenant';
}

interface AuthResponse {
  user: AuthUser;
  token: string;
}

const API_URL = 'http://127.0.0.1:8000/api'; // TODO : remplacer par l'URL de production le moment venu

@Injectable({ providedIn: 'root' })
export class AuthService {
  readonly currentUser = signal<AuthUser | null>(this.loadUserFromStorage());

  constructor(private http: HttpClient) {}

  // ============================================================
  // AUTHENTIFICATION
  // ============================================================

  register(
    name: string,
    email: string,
    password: string,
    passwordConfirmation: string
  ): Observable<AuthResponse> {
    return this.http
      .post<AuthResponse>(`${API_URL}/auth/register`, {
        name,
        email,
        password,
        password_confirmation: passwordConfirmation,
      })
      .pipe(tap((res) => this.persistSession(res)));
  }

  login(email: string, password: string): Observable<AuthResponse> {
    return this.http
      .post<AuthResponse>(`${API_URL}/auth/login`, { email, password })
      .pipe(tap((res) => this.persistSession(res)));
  }

  logout(): void {
    const token = localStorage.getItem('kmaa_token');

    if (token) {
      this.http.post(`${API_URL}/auth/logout`, {}).subscribe({
        complete: () => this.clearSession(),
        error: () => this.clearSession(), // on nettoie côté client même si l'appel échoue
      });
    } else {
      this.clearSession();
    }
  }

  // ============================================================
  // RAFRAÎCHIR LA SESSION (appelé au démarrage de l'app)
  // ============================================================

  refreshSession(): void {
    if (!this.getToken()) {
      return;
    }

    this.http.get<{ user: AuthUser }>(`${API_URL}/auth/me`).subscribe({
      next: (res) => {
        localStorage.setItem('kmaa_user', JSON.stringify(res.user));
        this.currentUser.set(res.user);
      },
      error: () => this.clearSession(), // token invalide ou expiré
    });
  }

  // ============================================================
  // HELPERS PUBLICS
  // ============================================================

  isLoggedIn(): boolean {
    return this.currentUser() !== null;
  }

  getToken(): string | null {
    return localStorage.getItem('kmaa_token');
  }

  // ============================================================
  // PRIVÉ
  // ============================================================

  private persistSession(res: AuthResponse): void {
    localStorage.setItem('kmaa_token', res.token);
    localStorage.setItem('kmaa_user', JSON.stringify(res.user));
    this.currentUser.set(res.user);
  }

  private clearSession(): void {
    localStorage.removeItem('kmaa_token');
    localStorage.removeItem('kmaa_user');
    this.currentUser.set(null);
  }

  private loadUserFromStorage(): AuthUser | null {
    const raw = localStorage.getItem('kmaa_user');
    return raw ? JSON.parse(raw) : null;
  }
}