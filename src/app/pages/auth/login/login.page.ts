import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { IonButton, IonContent, IonHeader, IonInput, IonItem, IonLabel, IonTitle, IonToolbar, LoadingController, ToastController } from '@ionic/angular/standalone';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  standalone: true,
  imports: [IonHeader, IonToolbar, IonTitle, IonContent, IonItem, IonLabel, IonInput, IonButton, ReactiveFormsModule, RouterLink],
  templateUrl: './login.page.html'
})
export class LoginPage {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);
  private loadingCtrl = inject(LoadingController);
  private toastCtrl = inject(ToastController);

  readonly form = this.fb.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]]
  });

  async submit() {
    if (this.form.invalid) return;
    const loading = await this.loadingCtrl.create({ message: 'Signing in...' });
    await loading.present();
    try {
      const { email, password } = this.form.getRawValue();
      await this.authService.login(email, password);
      await this.router.navigateByUrl('/tabs/dashboard');
    } catch {
      const toast = await this.toastCtrl.create({ message: 'Login failed. Check credentials.', duration: 2200, color: 'danger' });
      await toast.present();
    } finally {
      await loading.dismiss();
    }
  }
}
