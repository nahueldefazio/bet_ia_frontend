import { Routes } from '@angular/router';

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
  { path: '**', redirectTo: 'dashboard' },
];
