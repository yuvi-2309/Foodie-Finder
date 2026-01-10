import { Injectable, signal, PLATFORM_ID, inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { Observable, tap, catchError, throwError, switchMap } from 'rxjs';
import { User, RegisterRequest, LoginRequest, AuthResponse } from '../models/user.model';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly STORAGE_KEY = 'user';
  private readonly TOKEN_KEY = 'token';
  private readonly apiUrl = `${environment.apiUrl}/auth`;
  private readonly platformId = inject(PLATFORM_ID);
  private readonly isBrowser = isPlatformBrowser(this.platformId);
  
  currentUser = signal<User | null>(null);
  isAuthenticated = signal(false);

  constructor(
    private router: Router,
    private http: HttpClient
  ) {
    this.loadUserFromStorage();
  }

  private loadUserFromStorage(): void {
    if (!this.isBrowser) return;
    
    const userJson = localStorage.getItem(this.STORAGE_KEY);
    const token = localStorage.getItem(this.TOKEN_KEY);
    
    if (userJson && token) {
      try {
        const user = JSON.parse(userJson);
        this.currentUser.set(user);
        this.isAuthenticated.set(true);
        // Optionally verify token with /auth/me endpoint
        this.verifyToken().subscribe({
          error: () => this.logout()
        });
      } catch (error) {
        this.logout();
      }
    }
  }

  register(request: RegisterRequest): Observable<User> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/register`, request).pipe(
      switchMap(response => {
        // Store token
        if (this.isBrowser) {
          localStorage.setItem(this.TOKEN_KEY, response.access_token);
        }
        this.isAuthenticated.set(true);
        
        // Fetch user details
        return this.getCurrentUser();
      }),
      catchError(error => {
        console.error('Registration error:', error);
        return throwError(() => new Error(error.error?.detail || 'Registration failed'));
      })
    );
  }

  login(request: LoginRequest): Observable<User> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/login`, request).pipe(
      switchMap(response => {
        // Store token
        if (this.isBrowser) {
          localStorage.setItem(this.TOKEN_KEY, response.access_token);
        }
        this.isAuthenticated.set(true);
        
        // Fetch user details
        return this.getCurrentUser();
      }),
      catchError(error => {
        console.error('Login error:', error);
        return throwError(() => new Error(error.error?.detail || 'Login failed'));
      })
    );
  }

  getCurrentUser(): Observable<User> {
    return this.http.get<User>(`${this.apiUrl}/me`).pipe(
      tap(user => {
        if (this.isBrowser) {
          localStorage.setItem(this.STORAGE_KEY, JSON.stringify(user));
        }
        this.currentUser.set(user);
        this.isAuthenticated.set(true);
      }),
      catchError(error => {
        console.error('Get user error:', error);
        this.logout();
        return throwError(() => new Error('Failed to get user details'));
      })
    );
  }

  private verifyToken(): Observable<User> {
    return this.getCurrentUser();
  }

  logout(): void {
    if (this.isBrowser) {
      localStorage.removeItem(this.STORAGE_KEY);
      localStorage.removeItem(this.TOKEN_KEY);
    }
    this.currentUser.set(null);
    this.isAuthenticated.set(false);
    this.router.navigate(['/login']);
  }
}
