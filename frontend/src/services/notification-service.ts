import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { Notification } from './dtos/notification';
import { NotificationSettings } from './dtos/notification-settings';

@Injectable({ providedIn: 'root' })
export class NotificationService {
  private readonly http = inject(HttpClient);

  getAll(): Observable<Notification[]> {
    return this.http.get<Notification[]>('/api/notifications');
  }

  getSettings(): Observable<NotificationSettings> {
    return this.http.get<NotificationSettings>('/api/notifications/settings');
  }

  saveSettings(milestones: boolean): Observable<NotificationSettings> {
    return this.http.put<NotificationSettings>('/api/notifications/settings', { milestones });
  }
}
