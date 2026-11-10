import { Routes } from '@angular/router';
import { CrudPage } from '../components/crud-page/crud-page';
import { DEVICES, INSTALLATIONS, MEASUREMENTS } from '../shared/constants/pages';
import { ROLES } from '../shared/constants/roles';
import { authGuard } from '../shared/guards/auth-guard';
import { roleGuard } from '../shared/guards/role-guard';

const { owner, technician, admin } = ROLES;
const ownerOrAdmin = [roleGuard(owner, admin)];

export const routes: Routes = [
  { path: 'prijava', loadComponent: () => import('../views/login-view/login-view').then((m) => m.LoginView) },
  { path: 'registracija', loadComponent: () => import('../views/register-view/register-view').then((m) => m.RegisterView) },
  {
    path: '',
    canActivateChild: [authGuard],
    children: [
      { path: '', pathMatch: 'full', canActivate: ownerOrAdmin, loadComponent: () => import('../views/dashboard-view/dashboard-view').then((m) => m.DashboardView) },
      { path: 'pregled-platforme', canActivate: [roleGuard(admin)], loadComponent: () => import('../views/admin-overview-view/admin-overview-view').then((m) => m.AdminOverviewView) },
      { path: 'zemljevid', canActivate: ownerOrAdmin, loadComponent: () => import('../views/map-view/map-view').then((m) => m.MapView) },
      { path: 'toplotna-karta', canActivate: ownerOrAdmin, loadComponent: () => import('../views/heatmap-view/heatmap-view').then((m) => m.HeatmapView) },
      { path: 'napoved', canActivate: ownerOrAdmin, loadComponent: () => import('../views/forecast-view/forecast-view').then((m) => m.ForecastView) },
      { path: 'napoved/:id', canActivate: ownerOrAdmin, loadComponent: () => import('../views/forecast-detail-view/forecast-detail-view').then((m) => m.ForecastDetailView) },
      { path: 'obvestila', canActivate: [roleGuard(owner, technician, admin)], loadComponent: () => import('../views/notifications-view/notifications-view').then((m) => m.NotificationsView) },
      { path: 'alarmi', canActivate: ownerOrAdmin, loadComponent: () => import('../components/alarm-list/alarm-list').then((m) => m.AlarmList) },
      { path: 'sistemi', component: CrudPage, data: { config: INSTALLATIONS } },
      { path: 'sistemi/:id', loadComponent: () => import('../views/system-detail-view/system-detail-view').then((m) => m.SystemDetailView) },
      { path: 'naprave', component: CrudPage, data: { config: DEVICES } },
      { path: 'meritve', canActivate: [roleGuard(admin)], component: CrudPage, data: { config: MEASUREMENTS } },
      { path: 'servisni-nalogi', loadComponent: () => import('../components/service-order-list/service-order-list').then((m) => m.ServiceOrderList) },
      { path: 'porocila', canActivate: ownerOrAdmin, loadComponent: () => import('../components/placeholder/placeholder').then((m) => m.Placeholder), data: { title: 'Poročila', text: 'Izvoz poročil (PDF/CSV) še ni implementiran.' } },
      { path: 'nastavitve', canActivate: ownerOrAdmin, loadComponent: () => import('../views/settings-view/settings-view').then((m) => m.SettingsView) },
    ],
  },
  { path: '**', redirectTo: '' },
];
