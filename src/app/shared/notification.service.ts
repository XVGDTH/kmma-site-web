import { HttpClient } from '@angular/common/http';
import { Injectable, inject, signal } from '@angular/core';

export interface AppNotification {
  id: string;
  kind: string;          // devoir_corrige|forum_question|forum_reply|live_started|paiement
  title: string;
  message: string;
  courseSlug: string | null;
  read: boolean;
  createdAt: string;
}

@Injectable({ providedIn: 'root' })
export class NotificationService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = 'https://api.convergesas.com/api';

  readonly notifications = signal<AppNotification[]>([]);
  readonly unreadCount = signal(0);

  /** Charge la liste + le badge (appelÃ© au boot + au polling). */
  load(): void {
    this.http
      .get<{ data: AppNotification[]; unreadCount: number }>(
        `${this.apiUrl}/notifications`
      )
      .subscribe({
        next: (res) => {
          this.notifications.set(res.data ?? []);
          this.unreadCount.set(res.unreadCount ?? 0);
        },
        error: () => {},
      });
  }

  markRead(id: string): void {
    this.http
      .post(`${this.apiUrl}/notifications/read`, { id })
      .subscribe(() => this.load());
  }

  markAllRead(): void {
    this.http
      .post(`${this.apiUrl}/notifications/read-all`, {})
      .subscribe(() => this.load());
  }
}