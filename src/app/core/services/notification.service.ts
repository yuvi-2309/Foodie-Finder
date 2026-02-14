import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap, catchError, throwError, interval, switchMap, of } from 'rxjs';
import { Notification } from '../models/restaurant.model';
import { environment } from '../../../environments/environment';

@Injectable({
    providedIn: 'root'
})
export class NotificationService {
    private readonly apiUrl = environment.apiUrl;

    notifications = signal<Notification[]>([]);
    unreadCount = signal(0);

    private http = signal<HttpClient | null>(null);

    constructor(private httpClient: HttpClient) {}

    loadNotifications(): Observable<Notification[]> {
        return this.httpClient.get<Notification[]>(`${this.apiUrl}/notifications/`).pipe(
            tap(notifications => {
                const notifs = Array.isArray(notifications) ? notifications : [];
                this.notifications.set(notifs);
                this.unreadCount.set(notifs.filter(n => !n.read).length);
            }),
            catchError(error => {
                console.error('Error fetching notifications:', error);
                return of([]);
            })
        );
    }

    markAsRead(notificationId: string): Observable<unknown> {
        return this.httpClient.patch(`${this.apiUrl}/notifications/${notificationId}/read`, {}).pipe(
            tap(() => {
                const current = this.notifications();
                this.notifications.set(
                    current.map(n => n.id === notificationId ? { ...n, read: true } : n)
                );
                this.unreadCount.set(this.notifications().filter(n => !n.read).length);
            }),
            catchError(error => {
                console.error('Error marking notification as read:', error);
                return throwError(() => new Error('Failed to mark notification as read'));
            })
        );
    }

    markAllAsRead(): void {
        const unread = this.notifications().filter(n => !n.read);
        unread.forEach(n => {
            this.markAsRead(n.id).subscribe();
        });
    }
}
