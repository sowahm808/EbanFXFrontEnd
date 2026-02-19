import { Component, OnInit, inject } from '@angular/core';
import { Router } from '@angular/router';
import { IonButton, IonContent, IonHeader, IonTitle, IonToolbar } from '@ionic/angular/standalone';
import { AuthService } from '../../../core/services/auth.service';
import { UserService } from '../../../core/services/user.service';

@Component({
  standalone: true,
  imports: [IonHeader, IonToolbar, IonTitle, IonContent, IonButton],
  template: `
    <ion-header><ion-toolbar><ion-title>Profile</ion-title></ion-toolbar></ion-header>
    <ion-content class="ion-padding">
      <p>Email: {{ userService.profileSignal()?.email }}</p>
      <p>Role: {{ userService.profileSignal()?.role }}</p>
      <p>KYC: {{ userService.profileSignal()?.kycStatus }}</p>
      <ion-button expand="block" fill="outline" (click)="refresh()">Refresh Profile</ion-button>
      <ion-button expand="block" color="danger" (click)="logout()">Logout</ion-button>
    </ion-content>
  `
})
export class ProfilePage implements OnInit {
  readonly userService = inject(UserService);
  private authService = inject(AuthService);
  private router = inject(Router);

  ngOnInit() { this.refresh(); }
  refresh() { this.userService.refreshMe().subscribe(); }
  async logout() { await this.authService.logout(); this.userService.clear(); await this.router.navigateByUrl('/auth/login'); }
}
