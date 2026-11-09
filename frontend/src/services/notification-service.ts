import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { Notification } from './dtos/notification';

@Injectable({ providedIn: 'root' })
export class NotificationService {
  private readonly http = inject(HttpClient);

  getAll(): Observable<Notification[]> {
    return this.http.get<Notification[]>('/api/notifications');
  }
}
