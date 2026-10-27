import { Routes } from '@angular/router';
import { CrudPage } from './crud-page';
import { DEVICES, INSTALLATIONS, MEASUREMENTS } from './pages';

export const routes: Routes = [
  { path: '', pathMatch: 'full', loadComponent: () => import('./dashboard').then((m) => m.Dashboard) },
  { path: 'zemljevid', loadComponent: () => import('./map-page').then((m) => m.MapPage) },
  { path: 'toplotna-karta', loadComponent: () => import('./heatmap-page').then((m) => m.HeatmapPage) },
  { path: 'napoved', loadComponent: () => import('./forecast-page').then((m) => m.ForecastPage) },
  { path: 'alarmi', loadComponent: () => import('./alarm-list').then((m) => m.AlarmList) },
  { path: 'sistemi', component: CrudPage, data: { config: INSTALLATIONS } },
  { path: 'sistemi/:id', loadComponent: () => import('./system-detail').then((m) => m.SystemDetail) },
  { path: 'naprave', component: CrudPage, data: { config: DEVICES } },
  { path: 'meritve', component: CrudPage, data: { config: MEASUREMENTS } },
  { path: 'servisni-nalogi', loadComponent: () => import('./placeholder').then((m) => m.Placeholder), data: { title: 'Servisni nalogi', text: 'Servisni nalogi še niso implementirani (v bazi ni tabele).' } },
  { path: 'porocila', loadComponent: () => import('./placeholder').then((m) => m.Placeholder), data: { title: 'Poročila', text: 'Izvoz poročil (PDF/CSV) še ni implementiran.' } },
  { path: 'nastavitve', loadComponent: () => import('./placeholder').then((m) => m.Placeholder), data: { title: 'Nastavitve', text: 'Nastavitve (cena elektrike, pragovi alarmov) še niso implementirane.' } },
  { path: '**', redirectTo: '' },
];
