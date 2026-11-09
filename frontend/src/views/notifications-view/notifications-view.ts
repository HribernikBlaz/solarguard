import { DatePipe } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { Pager } from '../../components/pager/pager';
import { Notification } from '../../services/dtos/notification';
import { NotificationService } from '../../services/notification-service';
import { errorText } from '../../shared/http/error-text';
import { pagedList } from '../../shared/utils/paging';

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
  private readonly service = inject(NotificationService);

  ngOnInit() {
    this.service.getAll().subscribe({
      next: (notifications) => {
        this.notifications.set(notifications);
        this.ready.set(true);
      },
      error: (e) => this.error.set(errorText(e)),
    });
  }
}
