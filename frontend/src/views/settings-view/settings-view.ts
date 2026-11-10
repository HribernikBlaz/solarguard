import { Component, OnInit, inject, signal } from '@angular/core';
import { AuthService } from '../../services/auth-service';
import { NotificationSettings } from '../../services/dtos/notification-settings';
import { NotificationService } from '../../services/notification-service';
import { errorText } from '../../shared/http/error-text';

@Component({
  selector: 'app-settings-view',
  templateUrl: './settings-view.html',
})
export class SettingsView implements OnInit {
  protected readonly settings = signal<NotificationSettings | null>(null);
  protected readonly saving = signal(false);
  protected readonly error = signal('');
  protected readonly email = inject(AuthService).session()?.email;
  private readonly service = inject(NotificationService);

  ngOnInit() {
    this.service.getSettings().subscribe({
      next: (settings) => this.settings.set(settings),
      error: (e) => this.error.set(errorText(e)),
    });
  }

  protected toggleMilestones(event: Event) {
    const previous = this.settings();
    if (!previous || this.saving()) {
      return;
    }

    const input = event.target as HTMLInputElement;
    const milestones = input.checked;
    this.settings.set({ ...previous, milestones });
    this.saving.set(true);
    this.error.set('');
    this.service.saveSettings(milestones).subscribe({
      next: (saved) => {
        this.settings.set(saved);
        this.saving.set(false);
      },
      error: (e) => {
        // Vezava se ne osveži, če je bila vrednost vmes enaka prikazani, zato stikalo vrnemo tudi v DOM.
        input.checked = previous.milestones;
        this.settings.set(previous);
        this.error.set(errorText(e));
        this.saving.set(false);
      },
    });
  }
}
