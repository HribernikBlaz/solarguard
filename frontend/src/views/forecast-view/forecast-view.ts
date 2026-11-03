import { Component, OnInit, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ForecastCard } from '../../components/forecast-card/forecast-card';
import { Overview } from '../../services/dtos/overview';
import { SolarDataService } from '../../services/solar-data-service';

@Component({
  selector: 'app-forecast-view',
  imports: [FormsModule, ForecastCard],
  templateUrl: './forecast-view.html',
})
export class ForecastView implements OnInit {
  protected readonly overviews = signal<Overview[]>([]);
  protected readonly days = signal(7);
  protected readonly error = signal('');
  private readonly data = inject(SolarDataService);

  ngOnInit() {
    this.data.overview().subscribe({
      next: (os) => this.overviews.set(os),
      error: (e) => this.error.set(`Napaka ${e.status}`),
    });
  }
}
