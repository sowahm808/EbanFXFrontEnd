import { Injectable, computed, inject, signal } from '@angular/core';
import { Auth, User, authState, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut } from '@angular/fire/auth';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private static readonly tokenStorageKey = 'ebanfx_id_token';
  private readonly auth = inject(Auth);
  private readonly userSignal = signal<User | null>(null);
  readonly currentUser$: Observable<User | null> = authState(this.auth);
  readonly currentUserSignal = computed(() => this.userSignal());

  constructor() {
    this.currentUser$.subscribe((user) => {
      this.userSignal.set(user);

      if (!user) {
        this.clearStoredToken();
      }
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

  async getIdToken(): Promise<string | null> {
    const user = this.auth.currentUser;
    if (!user) {
      this.clearStoredToken();
      return null;
    }

    const idToken = await user.getIdToken();
    this.storeToken(idToken);
    return idToken;
  }

  private storeToken(token: string) {
    localStorage.setItem(AuthService.tokenStorageKey, token);
  }

  private clearStoredToken() {
    localStorage.removeItem(AuthService.tokenStorageKey);
  }
}
