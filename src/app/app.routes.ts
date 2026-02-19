import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { roleGuard } from './core/guards/role.guard';

export const appRoutes: Routes = [
  { path: '', redirectTo: 'welcome', pathMatch: 'full' },
  { path: 'welcome', loadComponent: () => import('./pages/welcome/welcome.page').then((m) => m.WelcomePage) },
  { path: 'auth/login', loadComponent: () => import('./pages/auth/login/login.page').then((m) => m.LoginPage) },
  { path: 'auth/register', loadComponent: () => import('./pages/auth/register/register.page').then((m) => m.RegisterPage) },
  { path: 'kyc', canActivate: [authGuard], loadComponent: () => import('./pages/kyc/kyc.page').then((m) => m.KycPage) },
  {
    path: 'tabs',
    canActivate: [authGuard],
    loadComponent: () => import('./pages/tabs/tabs.page').then((m) => m.TabsPage),
    children: [
      { path: 'dashboard', loadComponent: () => import('./pages/tabs/dashboard/dashboard.page').then((m) => m.DashboardPage) },
      { path: 'beneficiaries', loadComponent: () => import('./pages/tabs/beneficiaries/beneficiaries.page').then((m) => m.BeneficiariesPage) },
      { path: 'orders', loadComponent: () => import('./pages/tabs/orders/orders.page').then((m) => m.OrdersPage) },
      { path: 'profile', loadComponent: () => import('./pages/tabs/profile/profile.page').then((m) => m.ProfilePage) },
      { path: 'admin', canActivate: [roleGuard], loadComponent: () => import('./pages/tabs/admin/admin.page').then((m) => m.AdminPage) },
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' }
    ]
  },
  { path: 'order/:id', canActivate: [authGuard], loadComponent: () => import('./pages/order-detail/order-detail.page').then((m) => m.OrderDetailPage) },
  { path: '**', redirectTo: 'welcome' }
];
