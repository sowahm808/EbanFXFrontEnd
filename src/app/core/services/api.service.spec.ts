import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { ApiService } from './api.service';
import { environment } from '../../../environments/environment';

describe('ApiService', () => {
  let service: ApiService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [HttpClientTestingModule] });
    service = TestBed.inject(ApiService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  it('calls /me endpoint', () => {
    service.getMe().subscribe();
    const req = httpMock.expectOne(`${environment.apiBaseUrl}/me`);
    expect(req.request.method).toBe('GET');
  });

  afterEach(() => httpMock.verify());
});
