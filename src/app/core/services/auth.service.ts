import { Injectable, computed, inject, signal } from '@angular/core';
import { Auth, User, authState, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut } from '@angular/fire/auth';
import { Observable } from 'rxjs';
import { firstValueFrom, take } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private static readonly tokenStorageKey = 'ebanfx_id_token';
  private readonly auth = inject(Auth);
  private readonly userSignal = signal<User | null>(null);
  readonly currentUser$: Observable<User | null> = authState(this.auth);
  readonly currentUserSignal = computed(() => this.userSignal());
  private readonly authReady = firstValueFrom(this.currentUser$.pipe(take(1)));

  waitForAuthReady(): Promise<User | null> {
    return this.authReady;
  }

  constructor() {
    this.currentUser$.subscribe((user) => {
      this.userSignal.set(user);
    });
  }

  async login(email: string, password: string): Promise<void> {
    const credential = await signInWithEmailAndPassword(this.auth, email, password);
    const idToken = await credential.user.getIdToken();
    this.storeToken(idToken);
  }

  async register(email: string, password: string): Promise<void> {
    const credential = await createUserWithEmailAndPassword(this.auth, email, password);
    const idToken = await credential.user.getIdToken();
    this.storeToken(idToken);
  }

  async logout(): Promise<void> {
    await signOut(this.auth);
    this.clearStoredToken();
  }

  clearStoredAuth(): void {
    this.clearStoredToken();
  }

  hasStoredAuthToken(): boolean {
    return !!this.getValidStoredToken();
  }

  async getIdToken(): Promise<string | null> {
    await this.authReady;

    const user = this.auth.currentUser;
    if (user) {
      const idToken = await user.getIdToken();
      this.storeToken(idToken);
      return idToken;
    }

    return this.getValidStoredToken();
  }

  async getFreshIdToken(): Promise<string | null> {
    await this.authReady;

    const user = this.auth.currentUser;
    if (!user) {
      return null;
    }

    const idToken = await user.getIdToken(true);
    this.storeToken(idToken);
    return idToken;
  }

  private storeToken(token: string) {
    localStorage.setItem(AuthService.tokenStorageKey, token);
  }

  private clearStoredToken() {
    localStorage.removeItem(AuthService.tokenStorageKey);
  }

  private getStoredToken(): string | null {
    return localStorage.getItem(AuthService.tokenStorageKey);
  }

  private getValidStoredToken(): string | null {
    const token = this.getStoredToken();
    if (!token) {
      return null;
    }

    if (this.isTokenExpired(token)) {
      this.clearStoredToken();
      return null;
    }

    return token;
  }

  private isTokenExpired(token: string): boolean {
    const parts = token.split('.');
    if (parts.length !== 3) {
      return true;
    }

    try {
      const payloadBase64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');
      const payloadJson = atob(payloadBase64);
      const payload = JSON.parse(payloadJson) as { exp?: number };
      const exp = payload.exp;

      if (!exp || !Number.isFinite(exp)) {
        return true;
      }

      return exp * 1000 <= Date.now();
    } catch {
      return true;
    }
  }
}
