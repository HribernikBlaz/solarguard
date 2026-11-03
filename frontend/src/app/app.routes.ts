import { Routes } from '@angular/router';
import { CrudPage } from '../components/crud-page/crud-page';
import { DEVICES, INSTALLATIONS, MEASUREMENTS } from '../shared/constants/pages';
import { authGuard } from '../shared/guards/auth-guard';

export const routes: Routes = [
  { path: 'prijava', loadComponent: () => import('../views/login-view/login-view').then((m) => m.LoginView) },
  { path: 'registracija', loadComponent: () => import('../views/register-view/register-view').then((m) => m.RegisterView) },
  {
    path: '',
    canActivateChild: [authGuard],
    children: [
      { path: '', pathMatch: 'full', loadComponent: () => import('../views/dashboard-view/dashboard-view').then((m) => m.DashboardView) },
      { path: 'zemljevid', loadComponent: () => import('../views/map-view/map-view').then((m) => m.MapView) },
      { path: 'toplotna-karta', loadComponent: () => import('../views/heatmap-view/heatmap-view').then((m) => m.HeatmapView) },
      { path: 'napoved', loadComponent: () => import('../views/forecast-view/forecast-view').then((m) => m.ForecastView) },
      { path: 'alarmi', loadComponent: () => import('../components/alarm-list/alarm-list').then((m) => m.AlarmList) },
      { path: 'sistemi', component: CrudPage, data: { config: INSTALLATIONS } },
      { path: 'sistemi/:id', loadComponent: () => import('../views/system-detail-view/system-detail-view').then((m) => m.SystemDetailView) },
      { path: 'naprave', component: CrudPage, data: { config: DEVICES } },
      { path: 'meritve', component: CrudPage, data: { config: MEASUREMENTS } },
      { path: 'servisni-nalogi', loadComponent: () => import('../components/service-order-list/service-order-list').then((m) => m.ServiceOrderList) },
      { path: 'porocila', loadComponent: () => import('../components/placeholder/placeholder').then((m) => m.Placeholder), data: { title: 'Poročila', text: 'Izvoz poročil (PDF/CSV) še ni implementiran.' } },
      { path: 'nastavitve', loadComponent: () => import('../components/placeholder/placeholder').then((m) => m.Placeholder), data: { title: 'Nastavitve', text: 'Nastavitve (cena elektrike, pragovi alarmov) še niso implementirane.' } },
    ],
  },
  { path: '**', redirectTo: '' },
];
