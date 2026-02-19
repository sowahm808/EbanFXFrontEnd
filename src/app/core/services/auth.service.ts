import { Injectable, computed, inject, signal } from '@angular/core';
import { Auth, User, authState, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut } from '@angular/fire/auth';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly auth = inject(Auth);
  private readonly userSignal = signal<User | null>(null);
  readonly currentUser$: Observable<User | null> = authState(this.auth);
  readonly currentUserSignal = computed(() => this.userSignal());

  constructor() {
    this.currentUser$.subscribe((user) => this.userSignal.set(user));
  }

  login(email: string, password: string): Promise<void> {
    return signInWithEmailAndPassword(this.auth, email, password).then(() => undefined);
  }

  register(email: string, password: string): Promise<void> {
    return createUserWithEmailAndPassword(this.auth, email, password).then(() => undefined);
  }

  logout(): Promise<void> {
    return signOut(this.auth);
  }

  async getIdToken(): Promise<string | null> {
    const user = this.auth.currentUser;
    if (!user) {
      return null;
    }
    return user.getIdToken();
  }
}
