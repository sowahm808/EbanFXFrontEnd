import { Component, inject } from '@angular/core';
import { IonLabel, IonRouterOutlet, IonTabBar, IonTabButton, IonTabs } from '@ionic/angular/standalone';
import { UserService } from '../../core/services/user.service';

@Component({
  standalone: true,
  imports: [IonTabs, IonTabBar, IonTabButton, IonLabel, IonRouterOutlet],
  template: `
  <ion-tabs>
    <ion-router-outlet />
    <ion-tab-bar slot="bottom">
      <ion-tab-button tab="dashboard" href="/tabs/dashboard"><ion-label>Dashboard</ion-label></ion-tab-button>
      <ion-tab-button tab="beneficiaries" href="/tabs/beneficiaries"><ion-label>Beneficiaries</ion-label></ion-tab-button>
      <ion-tab-button tab="orders" href="/tabs/orders"><ion-label>Orders</ion-label></ion-tab-button>
      <ion-tab-button tab="profile" href="/tabs/profile"><ion-label>Profile</ion-label></ion-tab-button>
      @if(showAdmin){<ion-tab-button tab="admin" href="/tabs/admin"><ion-label>Admin</ion-label></ion-tab-button>}
    </ion-tab-bar>
  </ion-tabs>
  `
})
export class TabsPage {
  private userService = inject(UserService);
  get showAdmin() {
    const role = this.userService.profileSignal()?.role;
    return role === 'admin' || role === 'compliance';
  }
}
