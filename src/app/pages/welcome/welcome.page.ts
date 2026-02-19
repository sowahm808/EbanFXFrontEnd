import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { IonButton, IonContent, IonHeader, IonTitle, IonToolbar } from '@ionic/angular/standalone';

@Component({
  standalone: true,
  imports: [IonHeader, IonToolbar, IonTitle, IonContent, IonButton, RouterLink],
  template: `
    <ion-header><ion-toolbar><ion-title>EbanFX</ion-title></ion-toolbar></ion-header>
    <ion-content class="ion-padding">
      <h1>Cross-border payouts from Ghana</h1>
      <p>Send GHS and settle to USDT wallets quickly, securely, and transparently.</p>
      <ion-button expand="block" routerLink="/auth/login">Login</ion-button>
      <ion-button expand="block" fill="outline" routerLink="/auth/register">Create account</ion-button>
    </ion-content>
  `
})
export class WelcomePage {}
