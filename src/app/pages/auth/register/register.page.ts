import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { IonButton, IonContent, IonHeader, IonInput, IonItem, IonLabel, IonTitle, IonToolbar, LoadingController, ToastController } from '@ionic/angular/standalone';
import { AuthService } from '../../../core/services/auth.service';

type FirebaseAuthError = {
  code?: string;
};

@Component({
  standalone: true,
  imports: [IonHeader, IonToolbar, IonTitle, IonContent, IonItem, IonLabel, IonInput, IonButton, ReactiveFormsModule, RouterLink],
  templateUrl: './register.page.html'
})
export class RegisterPage {
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
    this.blurFocusedElement();

    const loading = await this.loadingCtrl.create({ message: 'Creating account...' });
    await loading.present();

    try {
      const { email, password } = this.form.getRawValue();
      await this.authService.register(email, password);
      await loading.dismiss();
      await this.router.navigateByUrl('/kyc');
    } catch (error) {
      await loading.dismiss();
      const toast = await this.toastCtrl.create({
        message: this.getRegistrationErrorMessage(error),
        duration: 2800,
        color: 'danger'
      });
      await toast.present();
    }
  }

  private blurFocusedElement(): void {
    const activeElement = document.activeElement;
    if (activeElement instanceof HTMLElement) {
      activeElement.blur();
    }
  }

  private getRegistrationErrorMessage(error: unknown): string {
    const firebaseCode = (error as FirebaseAuthError | null)?.code;
    switch (firebaseCode) {
      case 'auth/operation-not-allowed':
        return 'Email/password signup is disabled in Firebase. Enable it in Authentication > Sign-in method.';
      case 'auth/email-already-in-use':
        return 'An account with this email already exists. Please login instead.';
      case 'auth/invalid-email':
        return 'Please enter a valid email address.';
      case 'auth/weak-password':
        return 'Password is too weak. Use at least 6 characters.';
      case 'auth/unauthorized-domain':
        return 'This domain is not authorized in Firebase Auth. Add it in Firebase Console > Authentication > Settings > Authorized domains.';
      default:
        return 'Registration failed. Please try again.';
    }
  }
}
