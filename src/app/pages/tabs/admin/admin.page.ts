import { Component, OnInit, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { IonButton, IonContent, IonHeader, IonInput, IonItem, IonLabel, IonList, IonTitle, IonToolbar } from '@ionic/angular/standalone';
import { ApiService } from '../../../core/services/api.service';
import { AdminKycItem } from '../../../core/models/kyc.model';
import { Order } from '../../../core/models/order.model';

@Component({
  standalone: true,
  imports: [IonHeader, IonToolbar, IonTitle, IonContent, IonList, IonItem, IonLabel, IonButton, IonInput, ReactiveFormsModule],
  templateUrl: './admin.page.html'
})
export class AdminPage implements OnInit {
  private api = inject(ApiService);
  private fb = inject(FormBuilder);
  readonly pendingKyc = signal<AdminKycItem[]>([]);
  readonly orders = signal<Order[]>([]);

  readonly actionForm = this.fb.nonNullable.group({
    notes: ['Reviewed', Validators.required],
    payoutRef: [''],
    reason: ['']
  });

  ngOnInit() {
    this.loadKyc();
    this.loadOrders();
  }

  loadKyc() { this.api.adminListPendingKyc().subscribe((res) => this.pendingKyc.set(res)); }
  loadOrders() { this.api.listOrders().subscribe((res) => this.orders.set(res)); }
  approve(id: string) { this.api.adminApproveKyc(id, this.actionForm.controls.notes.value).subscribe(() => this.loadKyc()); }
  reject(id: string) { this.api.adminRejectKyc(id, this.actionForm.controls.notes.value).subscribe(() => this.loadKyc()); }
  confirm(orderId: string) { this.api.adminConfirmFunds(orderId).subscribe(() => this.loadOrders()); }
  sent(orderId: string) { this.api.adminMarkSent(orderId, this.actionForm.controls.payoutRef.value || 'manual').subscribe(() => this.loadOrders()); }
  complete(orderId: string) { this.api.adminMarkCompleted(orderId).subscribe(() => this.loadOrders()); }
  flag(orderId: string) { this.api.adminFlagSuspicious(orderId, this.actionForm.controls.reason.value || 'manual review').subscribe(() => this.loadOrders()); }
}
