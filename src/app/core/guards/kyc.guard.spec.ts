import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { of } from 'rxjs';
import { kycGuard } from './kyc.guard';
import { UserService } from '../services/user.service';

describe('kycGuard', () => {
  it('allows approved users', (done) => {
    TestBed.configureTestingModule({
      providers: [
        { provide: UserService, useValue: { profile$: of({ kycStatus: 'approved' }) } },
        { provide: Router, useValue: { createUrlTree: () => 'kyc-tree' } }
      ]
    });

    TestBed.runInInjectionContext(() => {
      const result$ = kycGuard({} as never, {} as never);
      (result$ as any).subscribe((result: unknown) => {
        expect(result).toBeTrue();
        done();
      });
    });
  });
});
