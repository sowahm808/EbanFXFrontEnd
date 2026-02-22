import { Injectable, computed, inject, signal } from '@angular/core';
import { BehaviorSubject, catchError, from, of, switchMap, tap } from 'rxjs';
import { ApiService } from './api.service';
import { AuthService } from './auth.service';
import { CurrentUserProfile } from '../models/user.model';

@Injectable({ providedIn: 'root' })
export class UserService {
  private readonly api = inject(ApiService);
  private readonly auth = inject(AuthService);

  private readonly profileSubject = new BehaviorSubject<CurrentUserProfile | null>(null);
  readonly profile$ = this.profileSubject.asObservable();

  private readonly profileSignalInternal = signal<CurrentUserProfile | null>(null);
  readonly profileSignal = computed(() => this.profileSignalInternal());

  refreshMe() {
    // ✅ Wait for Firebase to establish currentUser before calling /me
    return from(this.auth.waitForAuthReady()).pipe(
      switchMap(() => this.api.getMe()),
      tap((profile) => {
        this.profileSubject.next(profile);
        this.profileSignalInternal.set(profile);
      }),
      catchError((err: any) => {
        /**
         * ✅ Important behavior change:
         * If we are logged in but /me fails (transient token issue),
         * don't clear immediately — let the interceptor refresh/retry and
         * avoid wiping UI state on boot races.
         */
        const hasSession = !!this.auth.currentUserSignal() || this.auth.hasStoredAuthToken();

        // If truly no session, clear
        if (!hasSession) {
          this.clear();
        }

        return of(null);
      })
    );
  }

  clear() {
    this.profileSubject.next(null);
    this.profileSignalInternal.set(null);
  }
}
