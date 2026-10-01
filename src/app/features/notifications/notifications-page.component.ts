import { Component, OnInit, inject, signal } from '@angular/core';
import { ApiService } from '../../core/services/api.service';

interface NotificationItem { id: string; title: string; message: string; type: string; status: string; createdAt: string }

@Component({
  selector: 'app-notifications-page',
  standalone: true,
  templateUrl: './notifications-page.component.html',
  styleUrl: './notifications-page.component.css'
})
export class NotificationsPageComponent implements OnInit {
  private readonly api = inject(ApiService);
  protected readonly notifications = signal<NotificationItem[]>([]);

  ngOnInit(): void {
    this.load();
  }

  read(id: string): void {
    this.api.patch(`/notifications/${id}/read`).subscribe(() => this.load());
  }

  private load(): void {
    this.api.get<NotificationItem[]>('/notifications').subscribe((items) => this.notifications.set(items));
  }
}
