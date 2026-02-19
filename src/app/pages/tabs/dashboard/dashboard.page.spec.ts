import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { DashboardPage } from './dashboard.page';
import { ApiService } from '../../../core/services/api.service';
import { UserService } from '../../../core/services/user.service';

describe('DashboardPage', () => {
  let fixture: ComponentFixture<DashboardPage>;
  let component: DashboardPage;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DashboardPage],
      providers: [
        { provide: ApiService, useValue: { createQuote: () => of({}), listOrders: () => of([]) } },
        { provide: UserService, useValue: { refreshMe: () => of({}), profileSignal: () => ({ kycStatus: 'pending' }) } }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(DashboardPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create component', () => {
    expect(component).toBeTruthy();
  });

  it('should compute quote countdown', () => {
    component.quote.set({ id: 'q1', amountGhs: 10, amountUsd: 1, customerRate: 12, feeGhs: 1, expiresAt: new Date(Date.now() + 30_000).toISOString() });
    component.tickCountdown();
    expect(component.remainingSeconds()).toBeGreaterThan(0);
  });
});
