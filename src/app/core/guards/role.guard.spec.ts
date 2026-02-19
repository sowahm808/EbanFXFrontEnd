import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { of } from 'rxjs';
import { roleGuard } from './role.guard';
import { UserService } from '../services/user.service';

describe('roleGuard', () => {
  it('blocks non-admin users', (done) => {
    TestBed.configureTestingModule({
      providers: [
        { provide: UserService, useValue: { profile$: of({ role: 'user' }) } },
        { provide: Router, useValue: { createUrlTree: () => 'dashboard-tree' } }
      ]
    });

    TestBed.runInInjectionContext(() => {
      const result$ = roleGuard({} as never, {} as never);
      (result$ as any).subscribe((result: unknown) => {
        expect(result).toBe('dashboard-tree');
        done();
      });
    });
  });
});
