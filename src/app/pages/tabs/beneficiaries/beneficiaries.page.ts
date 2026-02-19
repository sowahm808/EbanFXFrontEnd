import { Component, OnInit, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { IonButton, IonContent, IonHeader, IonInput, IonItem, IonLabel, IonList, IonTitle, IonToolbar, ToastController } from '@ionic/angular/standalone';
import { ApiService } from '../../../core/services/api.service';
import { Beneficiary } from '../../../core/models/beneficiary.model';

@Component({
  standalone: true,
  imports: [IonHeader, IonToolbar, IonTitle, IonContent, IonItem, IonLabel, IonInput, IonButton, IonList, ReactiveFormsModule],
  templateUrl: './beneficiaries.page.html'
})
export class BeneficiariesPage implements OnInit {
  private readonly api = inject(ApiService);
  private readonly fb = inject(FormBuilder);
  private readonly toastCtrl = inject(ToastController);
  readonly items = signal<Beneficiary[]>([]);

  readonly form = this.fb.nonNullable.group({
    name: ['', Validators.required],
    country: ['', Validators.required],
    walletAddress: ['', Validators.required]
  });

  ngOnInit() { this.load(); }

  load() { this.api.listBeneficiaries().subscribe((data) => this.items.set(data)); }

  async submit() {
    if (this.form.invalid) return;
    this.api.createBeneficiary({ ...this.form.getRawValue(), walletAsset: 'USDT', walletNetwork: 'TRON' }).subscribe(async () => {
      this.form.reset();
      this.load();
      const toast = await this.toastCtrl.create({ message: 'Beneficiary saved.', duration: 1600, color: 'success' });
      await toast.present();
    });
  }
}
