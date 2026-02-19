import { Component, OnDestroy, OnInit, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { IonButton, IonCard, IonCardContent, IonCardHeader, IonCardTitle, IonContent, IonHeader, IonInput, IonItem, IonLabel, IonTitle, IonToolbar, LoadingController, ToastController } from '@ionic/angular/standalone';
import { Subject, interval, takeUntil } from 'rxjs';
import { ApiService } from '../../../core/services/api.service';
import { Quote } from '../../../core/models/quote.model';
import { UserService } from '../../../core/services/user.service';

@Component({
  standalone: true,
  imports: [IonHeader, IonToolbar, IonTitle, IonContent, IonCard, IonCardHeader, IonCardTitle, IonCardContent, IonButton, IonItem, IonLabel, IonInput, ReactiveFormsModule],
  templateUrl: './dashboard.page.html'
})
export class DashboardPage implements OnInit, OnDestroy {
  private readonly fb = inject(FormBuilder);
  private readonly api = inject(ApiService);
  readonly userService = inject(UserService);
  private readonly loadingCtrl = inject(LoadingController);
  private readonly toastCtrl = inject(ToastController);
  private readonly router = inject(Router);
  private destroy$ = new Subject<void>();

  readonly quoteForm = this.fb.nonNullable.group({ amountGhs: [0, [Validators.required, Validators.min(1)]] });
  readonly quote = signal<Quote | null>(null);
  readonly remainingSeconds = signal(0);

  ngOnInit() {
    this.userService.refreshMe().subscribe();
    interval(1000).pipe(takeUntil(this.destroy$)).subscribe(() => this.tickCountdown());
  }

  async createQuote() {
    if (this.quoteForm.invalid) return;
    const loading = await this.loadingCtrl.create({ message: 'Fetching quote...' });
    await loading.present();
    this.api.createQuote(this.quoteForm.getRawValue()).subscribe({
      next: async (quote) => {
        this.quote.set(quote);
        this.tickCountdown();
        await loading.dismiss();
      },
      error: async () => {
        await loading.dismiss();
        const toast = await this.toastCtrl.create({ message: 'Could not create quote.', duration: 1800, color: 'danger' });
        await toast.present();
      }
    });
  }

  tickCountdown() {
    const quote = this.quote();
    if (!quote) return;
    const remaining = Math.max(0, Math.floor((new Date(quote.expiresAt).getTime() - Date.now()) / 1000));
    this.remainingSeconds.set(remaining);
  }

  goToKyc() { void this.router.navigateByUrl('/kyc'); }
  createOrder() { void this.router.navigateByUrl('/tabs/orders', { state: { quote: this.quote() } }); }

  ngOnDestroy() { this.destroy$.next(); this.destroy$.complete(); }
}
