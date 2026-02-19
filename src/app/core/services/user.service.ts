import { Injectable, computed, inject, signal } from '@angular/core';
import { BehaviorSubject, tap } from 'rxjs';
import { ApiService } from './api.service';
import { CurrentUserProfile } from '../models/user.model';

@Injectable({ providedIn: 'root' })
export class UserService {
  private readonly api = inject(ApiService);
  private readonly profileSubject = new BehaviorSubject<CurrentUserProfile | null>(null);
  readonly profile$ = this.profileSubject.asObservable();

  private readonly profileSignalInternal = signal<CurrentUserProfile | null>(null);
  readonly profileSignal = computed(() => this.profileSignalInternal());

  refreshMe() {
    return this.api.getMe().pipe(
      tap((profile) => {
        this.profileSubject.next(profile);
        this.profileSignalInternal.set(profile);
      })
    );
  }

  clear() {
    this.profileSubject.next(null);
    this.profileSignalInternal.set(null);
  }
}
