import { DatePipe } from '@angular/common';
import { Component, OnInit, inject, input, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Alarm } from '../../services/dtos/alarm';
import { AlarmService } from '../../services/alarm-service';
import { SEVERITY_LABELS, STATUS_LABELS } from '../../shared/constants/alarm-labels';

@Component({
  selector: 'app-alarm-list',
  imports: [DatePipe, RouterLink],
  templateUrl: './alarm-list.html',
})
export class AlarmList implements OnInit {
  readonly installationId = input<string>();
  protected readonly alarms = signal<Alarm[]>([]);
  protected readonly error = signal('');
  protected readonly severityLabels = SEVERITY_LABELS;
  protected readonly statusLabels = STATUS_LABELS;
  private readonly service = inject(AlarmService);

  ngOnInit() {
    this.service.getAll(this.installationId()).subscribe({
      next: (alarms) => this.alarms.set(alarms),
      error: (e) => this.error.set(`Napaka ${e.status}`),
    });
  }
}
