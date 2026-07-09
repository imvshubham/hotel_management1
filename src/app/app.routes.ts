import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { roleGuard } from './core/guards/role.guard';

export const routes: Routes = [
  // Public Landing Page (Unauthenticated access)
  {
    path: '',
    loadComponent: () => import('./features/landing/landing.component').then(m => m.LandingComponent),
    pathMatch: 'full'
  },

  // Auth Layout (Unauthenticated access)
  {
    path: 'auth',
    loadComponent: () => import('./layouts/auth-layout/auth-layout.component').then(m => m.AuthLayoutComponent),
    children: [
      {
        path: 'login',
        loadComponent: () => import('./features/auth/login/login.component').then(m => m.LoginComponent)
      },
      {
        path: 'register',
        loadComponent: () => import('./features/auth/register/register.component').then(m => m.RegisterComponent)
      },
      {
        path: '',
        redirectTo: 'login',
        pathMatch: 'full'
      }
    ]
  },

  // Dashboard Layout (Authenticated access)
  {
    path: '',
    loadComponent: () => import('./layouts/dashboard-layout/dashboard-layout.component').then(m => m.DashboardLayoutComponent),
    canActivate: [authGuard],
    children: [
      {
        path: 'dashboard',
        loadComponent: () => import('./features/dashboard/dashboard.component').then(m => m.DashboardComponent)
      },
      {
        path: 'reservation',
        loadComponent: () => import('./features/reservation/reservation.component').then(m => m.ReservationComponent)
      },
      {
        path: 'billing',
        loadComponent: () => import('./features/billing/billing.component').then(m => m.BillingComponent)
      },
      {
        path: 'payment',
        loadComponent: () => import('./features/payment/payment.component').then(m => m.PaymentComponent)
      },
      {
        path: 'history',
        loadComponent: () => import('./features/history/history.component').then(m => m.HistoryComponent)
      },
      {
        path: 'room-status',
        loadComponent: () => import('./features/room-status/room-status.component').then(m => m.RoomStatusComponent),
        canActivate: [roleGuard],
        data: { role: 'ADMIN' }
      },
      {
        path: 'bookings',
        loadComponent: () => import('./features/bookings/bookings.component').then(m => m.BookingsComponent)
      },
      {
        path: 'support',
        loadComponent: () => import('./features/support/support.component').then(m => m.SupportComponent)
      },
      {
        path: 'complaints',
        loadComponent: () => import('./features/complaints/complaints.component').then(m => m.ComplaintsComponent)
      }
    ]
  },

  // Fallback Catch All
  {
    path: '**',
    redirectTo: ''
  }
];
