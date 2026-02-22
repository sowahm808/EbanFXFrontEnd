import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import {
  IonButton,
  IonContent,
  IonHeader,
  IonInput,
  IonItem,
  IonLabel,
  IonTitle,
  IonToolbar,
  LoadingController,
  ToastController
} from '@ionic/angular/standalone';
import { firstValueFrom } from 'rxjs'; // ✅ ADD THIS
import { AuthService } from '../../../core/services/auth.service';
import { UserService } from '../../../core/services/user.service';

@Component({
  standalone: true,
  imports: [
    IonHeader, IonToolbar, IonTitle, IonContent,
    IonItem, IonLabel, IonInput, IonButton,
    ReactiveFormsModule, RouterLink
  ],
  templateUrl: './login.page.html'
})
export class LoginPage {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private userService = inject(UserService);
  private router = inject(Router);
  private loadingCtrl = inject(LoadingController);
  private toastCtrl = inject(ToastController);

  readonly form = this.fb.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]]
  });

  async submit() {
    if (this.form.invalid) return;
    this.blurFocusedElement();

    const loading = await this.loadingCtrl.create({ message: 'Signing in...' });
    await loading.present();

    try {
      const { email, password } = this.form.getRawValue();

      // 1) Login to Firebase
      await this.authService.login(email, password);

      // 2) Warm backend session (/me)
      const me = await firstValueFrom(this.userService.refreshMe());

      // If /me failed (returns null), stop and show message
      if (!me) {
        await loading.dismiss();
        const toast = await this.toastCtrl.create({
          message: 'Signed in, but backend rejected the token. Fix server Firebase Admin credentials (service account / project mismatch).',
          duration: 3500,
          color: 'danger'
        });
        await toast.present();
        return;
      }

      await loading.dismiss();
      await this.router.navigateByUrl('/tabs/dashboard', { replaceUrl: true });
    } catch (error) {
      await loading.dismiss();
      const toast = await this.toastCtrl.create({
        message: this.getLoginErrorMessage(error),
        duration: 2800,
        color: 'danger'
      });
      await toast.present();
    }
  }

  private blurFocusedElement(): void {
    const activeElement = document.activeElement;
    if (activeElement instanceof HTMLElement) activeElement.blur();
  }

  private getLoginErrorMessage(error: unknown): string {
    const firebaseCode = (error as { code?: string } | null)?.code;
    switch (firebaseCode) {
      case 'auth/invalid-credential':
      case 'auth/invalid-login-credentials':
      case 'auth/user-not-found':
      case 'auth/wrong-password':
        return 'Login failed. Check your email/password and try again.';
      case 'auth/too-many-requests':
        return 'Too many failed attempts. Please wait and try again.';
      case 'auth/unauthorized-domain':
        return 'This domain is not authorized in Firebase Auth. Add it in Firebase Console > Authentication > Settings > Authorized domains.';
      default:
        return 'Login failed. Please try again.';
    }
  }
}
