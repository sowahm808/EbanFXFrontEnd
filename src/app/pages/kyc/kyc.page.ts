import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { IonButton, IonContent, IonHeader, IonInput, IonItem, IonLabel, IonTitle, IonToolbar, LoadingController, ToastController } from '@ionic/angular/standalone';
import { ApiService } from '../../core/services/api.service';

@Component({
  standalone: true,
  imports: [IonHeader, IonToolbar, IonTitle, IonContent, IonItem, IonLabel, IonInput, IonButton, ReactiveFormsModule],
  templateUrl: './kyc.page.html'
})
export class KycPage {
  private fb = inject(FormBuilder);
  private api = inject(ApiService);
  private loadingCtrl = inject(LoadingController);
  private toastCtrl = inject(ToastController);

  readonly form = this.fb.nonNullable.group({
    fullName: ['', Validators.required],
    dateOfBirth: ['', Validators.required],
    phone: ['', Validators.required],
    nationalId: ['', Validators.required],
    address: ['', Validators.required],
    documentPlaceholder: ['Document upload pending', Validators.required]
  });

  async submit() {
    if (this.form.invalid) return;
    const loading = await this.loadingCtrl.create({ message: 'Submitting KYC...' });
    await loading.present();
    this.api.submitKyc(this.form.getRawValue()).subscribe({
      next: async () => {
        await loading.dismiss();
        const toast = await this.toastCtrl.create({ message: 'KYC submitted.', duration: 1800, color: 'success' });
        await toast.present();
      },
      error: async () => {
        await loading.dismiss();
        const toast = await this.toastCtrl.create({ message: 'KYC submission failed.', duration: 1800, color: 'danger' });
        await toast.present();
      }
    });
  }
}
