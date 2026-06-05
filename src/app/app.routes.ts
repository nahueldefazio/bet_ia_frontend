import { Routes } from '@angular/router';
import { authGuard } from './admin/auth.guard';

export const routes: Routes = [
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
  {
    path: 'dashboard',
    loadComponent: () => import('./dashboard/dashboard').then(m => m.DashboardComponent),
  },
  {
    path: 'value-bets',
    loadComponent: () => import('./value-bets/value-bets').then(m => m.ValueBetsComponent),
  },
  {
    path: 'alerts',
    loadComponent: () => import('./alerts/alerts').then(m => m.AlertsComponent),
  },
  {
    path: 'admin/login',
    loadComponent: () => import('./admin/login').then(m => m.AdminLoginComponent),
  },
  {
    path: 'admin',
    loadComponent: () => import('./admin/admin').then(m => m.AdminComponent),
    canActivate: [authGuard],
  },
  { path: '**', redirectTo: 'dashboard' },
];
