import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, RouterLink, RouterLinkActive, Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

interface NavItem {
  label: string;
  route: string;
  icon: string;
}

@Component({
  selector: 'app-dashboard-layout',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive],
  template: `
    <div class="min-h-screen bg-slate-50 flex">
      <!-- Sidebar for Desktop / Collapsible for Mobile -->
      <aside 
        [class.translate-x-0]="isSidebarOpen()" 
        [class.-translate-x-full]="!isSidebarOpen()" 
        class="fixed inset-y-0 left-0 z-40 w-64 bg-white border-r border-slate-100 flex flex-col transition-transform duration-200 ease-in-out lg:translate-x-0 lg:static lg:h-screen lg:shrink-0"
      >
        <!-- Sidebar Branding -->
        <div class="h-16 flex items-center gap-2 px-6 border-b border-slate-100">
          <div class="w-8 h-8 rounded bg-brand-dark flex items-center justify-center text-white font-black text-sm">H</div>
          <div>
            <h1 class="text-sm font-black tracking-tight text-brand-dark">The Shivalik</h1>
            <p class="text-[9px] tracking-widest uppercase font-mono text-slate-400">Grand Hotel</p>
          </div>
        </div>

        <!-- User profile display at the top of menu -->
        <div class="px-6 py-4 border-b border-slate-100 bg-slate-50/30">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-full bg-brand-blue/10 flex items-center justify-center text-brand-blue font-bold text-sm">
              {{ initials() }}
            </div>
            <div>
              <p class="text-xs font-semibold text-slate-800 leading-none mb-1">{{ currentUser()?.name }}</p>
              <span class="inline-block px-1.5 py-0.5 rounded text-[9px] font-bold tracking-wider uppercase font-mono"
                [ngClass]="isAdmin() ? 'bg-slate-900 text-white' : 'bg-brand-blue/10 text-brand-blue'">
                {{ currentUser()?.role }}
              </span>
            </div>
          </div>
        </div>

        <!-- Nav Menu -->
        <nav class="flex-1 px-4 py-4 space-y-1 overflow-y-auto">
          @for (item of navItems(); track item.route) {
            <a 
              [routerLink]="item.route" 
              routerLinkActive="bg-brand-blue-light text-brand-blue border-brand-blue font-semibold"
              [routerLinkActiveOptions]="{ exact: item.route === '/dashboard' }"
              (click)="closeSidebarOnMobile()"
              class="flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-medium text-slate-600 hover:bg-slate-50 hover:text-slate-900 border-l-2 border-transparent transition-all"
            >
              <span [innerHTML]="item.icon" class="w-4 h-4 text-slate-400 shrink-0"></span>
              {{ item.label }}
            </a>
          }
        </nav>

        <!-- Sidebar Footer -->
        <div class="p-4 border-t border-slate-100">
          <button 
            (click)="logout()" 
            class="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-medium text-red-500 hover:bg-red-50/50 transition-colors"
          >
            <!-- Logout Icon -->
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            Logout
          </button>
        </div>
      </aside>

      <!-- Sidebar Backdrop on Mobile -->
      @if (isSidebarOpen()) {
        <div 
          (click)="toggleSidebar()" 
          class="fixed inset-0 z-30 bg-slate-950/20 backdrop-blur-xxs lg:hidden"
        ></div>
      }

      <!-- Main Layout Body -->
      <div class="flex-1 flex flex-col min-w-0 lg:h-screen lg:overflow-hidden">
        <!-- Sticky Header with glassmorphism blur -->
        <header class="h-16 shrink-0 bg-white/70 backdrop-blur-md border-b border-slate-100 sticky top-0 z-20 flex items-center justify-between px-6">
          <div class="flex items-center gap-3">
            <button 
              (click)="toggleSidebar()" 
              class="lg:hidden p-2 -ml-2 text-slate-500 hover:text-slate-700 hover:bg-slate-50 rounded-lg transition-colors"
              aria-label="Toggle Sidebar"
            >
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <span class="text-xs font-semibold uppercase tracking-wider text-slate-400 font-mono">
              HMS Portal
            </span>
          </div>

          <div class="flex items-center gap-4">
            <span class="text-xs text-slate-500 hidden sm:inline">
              User ID: <span class="font-mono font-bold text-slate-800">{{ currentUser()?.id }}</span>
            </span>
          </div>
        </header>

        <!-- Page Content Frame -->
        <main class="flex-1 overflow-y-auto p-6 md:p-8">
          <div class="max-w-7xl mx-auto space-y-6">
            <router-outlet></router-outlet>
          </div>
        </main>
      </div>
    </div>
  `
})
export class DashboardLayoutComponent {
  private authService = inject(AuthService);
  private router = inject(Router);

  isSidebarOpen = signal<boolean>(false);

  currentUser = this.authService.currentUser;
  isAdmin = computed(() => this.authService.isAdmin());
  
  initials = computed(() => {
    const user = this.currentUser();
    if (!user) return '';
    return user.name
      .split(' ')
      .map(part => part[0])
      .slice(0, 2)
      .join('')
      .toUpperCase();
  });

  navItems = computed<NavItem[]>(() => {
    const admin = this.isAdmin();
    
    const homeIcon = `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/></svg>`;
    const resIcon = `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>`;
    const billIcon = `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>`;
    const histIcon = `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>`;
    const bookIcon = `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/></svg>`;
    const roomIcon = `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/></svg>`;
    const supportIcon = `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z"/></svg>`;

    if (admin) {
      return [
        { label: 'Dashboard Home', route: '/dashboard', icon: homeIcon },
        { label: 'Manage Reservations', route: '/reservation', icon: resIcon },
        { label: 'Billing & Invoices', route: '/billing', icon: billIcon },
        { label: 'Stay History', route: '/history', icon: histIcon },
        { label: 'Room Status', route: '/room-status', icon: roomIcon },
        { label: 'Upcoming Bookings', route: '/bookings', icon: bookIcon },
        { label: 'Support Queue', route: '/support', icon: supportIcon }
      ];
    } else {
      return [
        { label: 'Customer Portal', route: '/dashboard', icon: homeIcon },
        { label: 'Book Reservation', route: '/reservation', icon: resIcon },
        { label: 'My Bills', route: '/billing', icon: billIcon },
        { label: 'My History', route: '/history', icon: histIcon },
        { label: 'My Bookings', route: '/bookings', icon: bookIcon },
        { label: 'Support & Help', route: '/support', icon: supportIcon }
      ];
    }
  });

  toggleSidebar(): void {
    this.isSidebarOpen.update(v => !v);
  }

  closeSidebarOnMobile(): void {
    if (this.isSidebarOpen()) {
      this.isSidebarOpen.set(false);
    }
  }

  logout(): void {
    this.authService.logout();
  }
}
