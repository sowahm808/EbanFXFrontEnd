import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { of } from 'rxjs';
import { authGuard } from './auth.guard';
import { AuthService } from '../services/auth.service';

describe('authGuard', () => {
  it('allows access when user exists', (done) => {
    TestBed.configureTestingModule({
      providers: [
        { provide: AuthService, useValue: { currentUser$: of({ uid: '1' }), waitForAuthReady: async () => null } },
        { provide: Router, useValue: { createUrlTree: () => 'login-tree' } }
      ]
    });

    TestBed.runInInjectionContext(() => {
      const result$ = authGuard({} as never, {} as never);
      (result$ as any).subscribe((result: unknown) => {
        expect(result).toBeTrue();
        done();
      });
    });
  });

  it('redirects to login when user is missing', (done) => {
    TestBed.configureTestingModule({
      providers: [
        { provide: AuthService, useValue: { currentUser$: of(null), waitForAuthReady: async () => null } },
        { provide: Router, useValue: { createUrlTree: () => 'login-tree' } }
      ]
    });

    TestBed.runInInjectionContext(() => {
      const result$ = authGuard({} as never, {} as never);
      (result$ as any).subscribe((result: unknown) => {
        expect(result).toBe('login-tree');
        done();
      });
    });
  });
});
