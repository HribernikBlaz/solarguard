import { DatePipe } from '@angular/common';
import { Component, DestroyRef, OnInit, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { EMPTY, catchError, interval, startWith, switchMap } from 'rxjs';
import { Pager } from '../../components/pager/pager';
import { Notification } from '../../services/dtos/notification';
import { NotificationService } from '../../services/notification-service';
import { EMAIL_STATUS_LABELS, EMAIL_STATUS_TONES, NOTIFICATION_KIND_LABELS } from '../../shared/constants/notification-labels';
import { errorText } from '../../shared/http/error-text';
import { pagedList } from '../../shared/utils/paging';

const REFRESH_MS = 30_000;

@Component({
  selector: 'app-notifications-view',
  imports: [DatePipe, Pager],
  templateUrl: './notifications-view.html',
})
export class NotificationsView implements OnInit {
  protected readonly notifications = signal<Notification[]>([]);
  protected readonly ready = signal(false);
  protected readonly error = signal('');
  protected readonly paged = pagedList(this.notifications);
  protected readonly kindLabels = NOTIFICATION_KIND_LABELS;
  protected readonly emailLabels = EMAIL_STATUS_LABELS;
  protected readonly emailTones = EMAIL_STATUS_TONES;
  private readonly service = inject(NotificationService);
  private readonly destroyRef = inject(DestroyRef);

  ngOnInit() {
    interval(REFRESH_MS)
      .pipe(
        startWith(0),
        switchMap(() =>
          this.service.getAll().pipe(
            catchError((e) => {
              this.fail(e);

              return EMPTY;
            }),
          ),
        ),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe((notifications) => {
        this.notifications.set(notifications);
        this.error.set('');
        this.ready.set(true);
      });
  }

  // Osvežitev v ozadju ne briše seznama in ne javlja napake, ki je uporabnik ni sprožil.
  private fail(e: unknown) {
    if (!this.ready()) {
      this.error.set(errorText(e));
    }
  }
}
