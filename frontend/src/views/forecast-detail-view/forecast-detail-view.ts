import { Component, OnInit, inject, input, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { ForecastCard } from '../../components/forecast-card/forecast-card';
import { Installation } from '../../services/dtos/installation';
import { InstallationService } from '../../services/installation-service';
import { errorText } from '../../shared/http/error-text';

@Component({
  selector: 'app-forecast-detail-view',
  imports: [FormsModule, RouterLink, ForecastCard],
  templateUrl: './forecast-detail-view.html',
})
export class ForecastDetailView implements OnInit {
  readonly id = input.required<string>();
  protected readonly installation = signal<Installation | null>(null);
  protected readonly days = signal(7);
  protected readonly error = signal('');
  private readonly service = inject(InstallationService);

  ngOnInit() {
    this.service.get(this.id()).subscribe({
      next: (installation) => this.installation.set(installation),
      error: (e) => this.error.set(e.status === 404 ? 'Sistem ne obstaja.' : errorText(e)),
    });
  }
}
