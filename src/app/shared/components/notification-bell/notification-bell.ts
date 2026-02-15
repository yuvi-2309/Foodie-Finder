import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { MatBadgeModule } from '@angular/material/badge';
import { MatDividerModule } from '@angular/material/divider';
import { NotificationService } from '../../../core/services/notification.service';
import { AuthService } from '../../../core/services/auth.service';
import { Notification } from '../../../core/models/restaurant.model';

@Component({
  selector: 'app-notification-bell',
  imports: [
    CommonModule,
    MatIconModule,
    MatButtonModule,
    MatMenuModule,
    MatBadgeModule,
    MatDividerModule
  ],
  templateUrl: './notification-bell.html',
  styleUrl: './notification-bell.scss',
})
export class NotificationBell implements OnInit, OnDestroy {
  notificationService = inject(NotificationService);
  authService = inject(AuthService);
  private router = inject(Router);

  ngOnInit(): void {
    if (this.authService.isAuthenticated()) {
      this.notificationService.startPolling();
    }
  }

  ngOnDestroy(): void {
    this.notificationService.stopPolling();
  }

  onMenuOpen(): void {
    if (this.authService.isAuthenticated()) {
      // Mark all current notifications as seen so the dot disappears
      this.notificationService.markAllAsSeen();
      this.notificationService.loadNotifications().subscribe();
    }
  }

  markAsRead(notification: Notification): void {
    if (!notification.read) {
      this.notificationService.markAsRead(notification.id).subscribe();
    }
    if (notification.restaurant_id) {
      this.router.navigate(['/restaurants', notification.restaurant_id]);
    }
  }

  markAllAsRead(): void {
    this.notificationService.markAllAsRead();
  }

  getTimeAgo(dateStr: string | undefined): string {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  }
}
