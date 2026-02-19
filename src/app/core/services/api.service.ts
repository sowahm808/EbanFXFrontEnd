import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { Observable } from 'rxjs';
import { CreateBeneficiaryPayload, Beneficiary } from '../models/beneficiary.model';
import { AdminKycItem, KycStatusResponse, KycSubmissionPayload } from '../models/kyc.model';
import { CreateOrderPayload, Order } from '../models/order.model';
import { CreateQuotePayload, Quote } from '../models/quote.model';
import { CurrentUserProfile } from '../models/user.model';

@Injectable({ providedIn: 'root' })
export class ApiService {
  private readonly http = inject(HttpClient);
  private readonly base = environment.apiBaseUrl;

  getMe(): Observable<CurrentUserProfile> { return this.http.get<CurrentUserProfile>(`${this.base}/me`); }
  submitKyc(payload: KycSubmissionPayload): Observable<{ success: boolean }> { return this.http.post<{ success: boolean }>(`${this.base}/kyc/submit`, payload); }
  getKycStatus(): Observable<KycStatusResponse> { return this.http.get<KycStatusResponse>(`${this.base}/kyc/status`); }
  createBeneficiary(payload: CreateBeneficiaryPayload): Observable<Beneficiary> { return this.http.post<Beneficiary>(`${this.base}/beneficiaries`, payload); }
  listBeneficiaries(): Observable<Beneficiary[]> { return this.http.get<Beneficiary[]>(`${this.base}/beneficiaries`); }
  createQuote(payload: CreateQuotePayload): Observable<Quote> { return this.http.post<Quote>(`${this.base}/quotes`, payload); }
  createOrder(payload: CreateOrderPayload): Observable<Order> { return this.http.post<Order>(`${this.base}/orders`, payload); }
  listOrders(): Observable<Order[]> { return this.http.get<Order[]>(`${this.base}/orders`); }
  getOrder(id: string): Observable<Order> { return this.http.get<Order>(`${this.base}/orders/${id}`); }
  cancelOrder(id: string): Observable<{ success: boolean }> { return this.http.post<{ success: boolean }>(`${this.base}/orders/${id}/cancel`, {}); }
  adminListPendingKyc(): Observable<AdminKycItem[]> { return this.http.get<AdminKycItem[]>(`${this.base}/admin/kyc/pending`); }
  adminApproveKyc(id: string, notes: string): Observable<{ success: boolean }> { return this.http.post<{ success: boolean }>(`${this.base}/admin/kyc/${id}/approve`, { notes }); }
  adminRejectKyc(id: string, notes: string): Observable<{ success: boolean }> { return this.http.post<{ success: boolean }>(`${this.base}/admin/kyc/${id}/reject`, { notes }); }
  adminConfirmFunds(orderId: string): Observable<{ success: boolean }> { return this.http.post<{ success: boolean }>(`${this.base}/admin/orders/${orderId}/confirm-funds`, {}); }
  adminMarkSent(orderId: string, payoutRef: string): Observable<{ success: boolean }> { return this.http.post<{ success: boolean }>(`${this.base}/admin/orders/${orderId}/mark-sent`, { payoutRef }); }
  adminMarkCompleted(orderId: string): Observable<{ success: boolean }> { return this.http.post<{ success: boolean }>(`${this.base}/admin/orders/${orderId}/mark-completed`, {}); }
  adminFlagSuspicious(orderId: string, reason: string): Observable<{ success: boolean }> { return this.http.post<{ success: boolean }>(`${this.base}/admin/orders/${orderId}/flag-suspicious`, { reason }); }
}
