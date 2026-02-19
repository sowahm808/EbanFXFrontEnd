import { Component, OnInit, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { IonButton, IonContent, IonHeader, IonItem, IonLabel, IonList, IonTitle, IonToolbar } from '@ionic/angular/standalone';
import { ApiService } from '../../../core/services/api.service';
import { Order } from '../../../core/models/order.model';
import { formatAccraDate } from '../../../core/utils/date.util';

@Component({
  standalone: true,
  imports: [IonHeader, IonToolbar, IonTitle, IonContent, IonList, IonItem, IonLabel, IonButton, RouterLink],
  templateUrl: './orders.page.html'
})
export class OrdersPage implements OnInit {
  private api = inject(ApiService);
  private router = inject(Router);
  readonly orders = signal<Order[]>([]);

  ngOnInit() { this.refresh(); }
  refresh() { this.api.listOrders().subscribe((res) => this.orders.set(res)); }
  open(order: Order) { void this.router.navigate(['/order', order.id]); }
  formatted(value: string) { return formatAccraDate(value); }
}
