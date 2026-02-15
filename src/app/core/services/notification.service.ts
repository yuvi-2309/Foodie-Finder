import { Injectable, signal, OnDestroy, inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Observable, tap, catchError, of, Subscription, interval } from 'rxjs';
import { Notification } from '../models/restaurant.model';
import { environment } from '../../../environments/environment';

@Injectable({
    providedIn: 'root'
})
export class NotificationService implements OnDestroy {
    private readonly apiUrl = environment.apiUrl;
    private readonly POLL_INTERVAL = 30000; // 30 seconds
    private readonly SEEN_IDS_KEY = 'seen_notification_ids';
    private pollSubscription: Subscription | null = null;
    private readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID));

    private http = inject(HttpClient);

    notifications = signal<Notification[]>([]);
    unreadCount = signal(0);
    /** True when the API returned notification IDs not yet seen by the user */
    hasNew = signal(false);

    ngOnDestroy(): void {
        this.stopPolling();
    }

    loadNotifications(): Observable<Notification[]> {
        return this.http.get<Notification[]>(`${this.apiUrl}/notifications/`).pipe(
            tap(notifications => {
                const notifs = Array.isArray(notifications) ? notifications : [];
                const seenIds = this.getSeenIds();
                // Merge seen status: if we've seen it locally, treat as read
                const merged = notifs.map(n => seenIds.has(n.id) ? { ...n, read: true } : n);
                this.notifications.set(merged);
                this.unreadCount.set(merged.filter(n => !n.read).length);
                this.updateHasNew(notifs);
            }),
            catchError(error => {
                console.error('Error fetching notifications:', error);
                return of([]);
            })
        );
    }

    startPolling(): void {
        this.stopPolling();
        // Initial load
        this.loadNotifications().subscribe();
        // Poll every 30 seconds
        this.pollSubscription = interval(this.POLL_INTERVAL).subscribe(() => {
            this.loadNotifications().subscribe();
        });
    }

    stopPolling(): void {
        if (this.pollSubscription) {
            this.pollSubscription.unsubscribe();
            this.pollSubscription = null;
        }
    }

    markAsRead(notificationId: string): Observable<unknown> {
        return this.http.patch(`${this.apiUrl}/notifications/${notificationId}/read`, {}).pipe(
            tap(() => {
                const current = this.notifications();
                this.notifications.set(
                    current.map(n => n.id === notificationId ? { ...n, read: true } : n)
                );
                this.unreadCount.set(this.notifications().filter(n => !n.read).length);
                this.addSeenId(notificationId);
                this.updateHasNew(this.notifications());
            }),
            catchError(error => {
                console.error('Error marking notification as read:', error);
                return of(null);
            })
        );
    }

    markAllAsRead(): void {
        const all = this.notifications();
        // Mark all current IDs as seen locally
        const seenIds = this.getSeenIds();
        all.forEach(n => seenIds.add(n.id));
        this.saveSeenIds(seenIds);
        this.hasNew.set(false);
        // Also tell the backend
        const unread = all.filter(n => !n.read);
        unread.forEach(n => {
            this.markAsRead(n.id).subscribe();
        });
    }

    /** Called when the user opens the notification menu — marks all current IDs as seen */
    markAllAsSeen(): void {
        const seenIds = this.getSeenIds();
        const current = this.notifications();
        current.forEach(n => seenIds.add(n.id));
        this.saveSeenIds(seenIds);
        // Also update local state so the UI reflects seen status immediately
        this.notifications.set(current.map(n => ({ ...n, read: true })));
        this.unreadCount.set(0);
        this.hasNew.set(false);
    }

    clearNotifications(): void {
        this.notifications.set([]);
        this.unreadCount.set(0);
        this.hasNew.set(false);
        this.stopPolling();
    }

    // --- Seen-tracking helpers ---

    private updateHasNew(notifs: Notification[]): void {
        const seenIds = this.getSeenIds();
        const hasUnseen = notifs.some(n => !seenIds.has(n.id));
        this.hasNew.set(hasUnseen);
    }

    private getSeenIds(): Set<string> {
        if (!this.isBrowser) return new Set();
        try {
            const raw = localStorage.getItem(this.SEEN_IDS_KEY);
            return raw ? new Set<string>(JSON.parse(raw)) : new Set<string>();
        } catch {
            return new Set<string>();
        }
    }

    private saveSeenIds(ids: Set<string>): void {
        if (!this.isBrowser) return;
        localStorage.setItem(this.SEEN_IDS_KEY, JSON.stringify([...ids]));
    }

    private addSeenId(id: string): void {
        const ids = this.getSeenIds();
        ids.add(id);
        this.saveSeenIds(ids);
    }
}
