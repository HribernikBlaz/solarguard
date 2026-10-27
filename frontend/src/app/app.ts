import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';

@Component({
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  selector: 'app-root',
  template: `
    <header>
      <strong>SolarGuard</strong>
      <span>Lastnik</span>
    </header>
    <div class="shell">
      <nav>
        <a routerLink="/" routerLinkActive="active" [routerLinkActiveOptions]="{ exact: true }">Dashboard</a>
        <a routerLink="/zemljevid" routerLinkActive="active">Zemljevid</a>
        <a routerLink="/toplotna-karta" routerLinkActive="active">Toplotna karta</a>
        <a routerLink="/napoved" routerLinkActive="active">Napoved</a>
        <a routerLink="/sistemi" routerLinkActive="active">Moji sistemi</a>
        <a routerLink="/alarmi" routerLinkActive="active">Alarmi</a>
        <a routerLink="/servisni-nalogi" routerLinkActive="active">Servisni nalogi</a>
        <a routerLink="/porocila" routerLinkActive="active">Poročila</a>
        <a routerLink="/nastavitve" routerLinkActive="active">Nastavitve</a>
        <small>Podatki</small>
        <a routerLink="/naprave" routerLinkActive="active">Naprave</a>
        <a routerLink="/meritve" routerLinkActive="active">Meritve</a>
      </nav>
      <main><router-outlet /></main>
    </div>
  `,
})
export class App {}
