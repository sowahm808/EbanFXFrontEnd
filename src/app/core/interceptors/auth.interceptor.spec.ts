import { HttpHandlerFn, HttpRequest, HttpResponse } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { of } from 'rxjs';
import { authInterceptor } from './auth.interceptor';
import { AuthService } from '../services/auth.service';

describe('authInterceptor', () => {
  it('attaches bearer token when available', (done) => {
    TestBed.configureTestingModule({
      providers: [
        { provide: AuthService, useValue: { getIdToken: () => Promise.resolve('abc-token') } },
        { provide: Router, useValue: { navigateByUrl: jasmine.createSpy('navigateByUrl') } }
      ]
    });

    const req = new HttpRequest('GET', '/me');
    const next: HttpHandlerFn = (request) => {
      expect(request.headers.get('Authorization')).toBe('Bearer abc-token');
      return of(new HttpResponse({ status: 200 }));
    };

    TestBed.runInInjectionContext(() => {
      authInterceptor(req, next).subscribe(() => {
        done();
      });
    });
  });
});
