import { Component, OnInit, inject, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { IonButton, IonContent, IonHeader, IonItem, IonLabel, IonList, IonTitle, IonToolbar, ToastController } from '@ionic/angular/standalone';
import { ApiService } from '../../core/services/api.service';
import { Order } from '../../core/models/order.model';
import { formatAccraDate } from '../../core/utils/date.util';

@Component({
  standalone: true,
  imports: [IonHeader, IonToolbar, IonTitle, IonContent, IonButton, IonList, IonItem, IonLabel],
  templateUrl: './order-detail.page.html'
})
export class OrderDetailPage implements OnInit {
  private route = inject(ActivatedRoute);
  private api = inject(ApiService);
  private toastCtrl = inject(ToastController);
  readonly order = signal<Order | null>(null);

  ngOnInit() { this.refresh(); }

  refresh() {
    const id = this.route.snapshot.paramMap.get('id') as string;
    this.api.getOrder(id).subscribe((res) => this.order.set(res));
  }

  async cancel() {
    const order = this.order();
    if (!order) return;
    this.api.cancelOrder(order.id).subscribe(async () => {
      await (await this.toastCtrl.create({ message: 'Order cancelled.', duration: 1500, color: 'success' })).present();
      this.refresh();
    });
  }

  date(value: string) { return formatAccraDate(value); }
}
