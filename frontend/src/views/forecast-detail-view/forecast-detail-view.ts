import { Component, OnInit, inject, input, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { ForecastCard } from '../../components/forecast-card/forecast-card';
import { Overview } from '../../services/dtos/overview';
import { SolarDataService } from '../../services/solar-data-service';
import { errorText } from '../../shared/http/error-text';

@Component({
  selector: 'app-forecast-detail-view',
  imports: [FormsModule, RouterLink, ForecastCard],
  templateUrl: './forecast-detail-view.html',
})
export class ForecastDetailView implements OnInit {
  readonly id = input.required<string>();
  protected readonly overview = signal<Overview | null>(null);
  protected readonly days = signal(7);
  protected readonly ready = signal(false);
  protected readonly error = signal('');
  private readonly data = inject(SolarDataService);

  ngOnInit() {
    this.data.overview(this.id()).subscribe({
      next: (overviews) => {
        this.overview.set(overviews[0] ?? null);
        this.ready.set(true);
      },
      error: (e) => this.error.set(errorText(e)),
    });
  }
}
