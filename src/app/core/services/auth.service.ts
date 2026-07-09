import { Injectable, signal, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, of, throwError } from 'rxjs';
import { delay, tap, map } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { AuthResponse, User, UserRole } from '../models/user.model';
import { MockDataService } from './mock-data.service';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private http = inject(HttpClient);
  private router = inject(Router);
  private mockDb = inject(MockDataService);

  // Toggle this flag to switch between real HTTP backend and mock database
  private useMock = false;

  // Angular Signals for reactive state
  currentUser = signal<User | null>(null);
  token = signal<string | null>(null);

  constructor() {
    this.loadSession();
  }

  isLoggedIn(): boolean {
    return !!this.token() && !!this.currentUser();
  }

  isAdmin(): boolean {
    return this.currentUser()?.role === 'ADMIN';
  }

  loadSession(): void {
    const savedToken = localStorage.getItem('token');
    const savedUser = localStorage.getItem('user');

    if (savedToken && savedUser) {
      this.token.set(savedToken);
      this.currentUser.set(JSON.parse(savedUser));
    }
  }

  register(payload: Omit<User, 'id'> & { password?: string }): Observable<{ userId: string; message: string }> {
    // 🚨 BACKEND PATCH POINT
    if (this.useMock) {
      return new Observable<{ userId: string; message: string }>(subscriber => {
        setTimeout(() => {
          const users = this.mockDb.getData<User>('mock_users');
          
          // Check if username or email already exists
          const exists = users.some(u => u.username === payload.username || u.email === payload.email);
          if (exists) {
            subscriber.error(new Error('Username or email already exists.'));
            return;
          }

          // Generate a unique User ID
          const userId = `USR-${Math.floor(1000 + Math.random() * 9000)}`;
          const newUser: User = {
            id: userId,
            username: payload.username,
            name: payload.name,
            email: payload.email,
            countryCode: payload.countryCode,
            mobileNumber: payload.mobileNumber,
            address: payload.address,
            role: payload.role || 'CUSTOMER'
          };

          users.push(newUser);
          this.mockDb.saveData('mock_users', users);

          subscriber.next({ userId, message: 'Registration successful!' });
          subscriber.complete();
        }, 1200);
      });
    }

    return this.http.post<any>(`${environment.gatewayUrl}/auth/register`, payload).pipe(
      map(res => ({
        userId: String(res.user.id),
        message: 'Registration successful!'
      }))
    );
  }

  login(payload: { username: string; password?: string; role: UserRole }): Observable<AuthResponse> {
    // 🚨 BACKEND PATCH POINT
    if (this.useMock) {
      return new Observable<AuthResponse>(subscriber => {
        setTimeout(() => {
          const users = this.mockDb.getData<User>('mock_users');
          const matchedUser = users.find(u => u.username === payload.username && u.role === payload.role);

          if (!matchedUser) {
            subscriber.error(new Error('Invalid username, password or role selection.'));
            return;
          }

          const response: AuthResponse = {
            token: `mock-jwt-token-for-${matchedUser.id}-${Date.now()}`,
            user: matchedUser
          };

          // Save session
          localStorage.setItem('token', response.token);
          localStorage.setItem('user', JSON.stringify(response.user));
          
          // Update signals
          this.token.set(response.token);
          this.currentUser.set(response.user);

          subscriber.next(response);
          subscriber.complete();
        }, 1200);
      });
    }

    return this.http.post<AuthResponse>(`${environment.gatewayUrl}/auth/login`, payload).pipe(
      tap(res => {
        localStorage.setItem('token', res.token);
        localStorage.setItem('user', JSON.stringify(res.user));
        this.token.set(res.token);
        this.currentUser.set(res.user);
      })
    );
  }

  logout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    this.token.set(null);
    this.currentUser.set(null);
    this.router.navigate(['/auth/login']);
  }
}
