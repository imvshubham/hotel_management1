import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { forkJoin, of } from 'rxjs';
import { AuthService } from '../../core/services/auth.service';
import { ReservationService } from '../../core/services/reservation.service';
import { RoomService } from '../../core/services/room.service';
import { BillingService } from '../../core/services/billing.service';
import { Reservation } from '../../core/models/reservation.model';
import { Room } from '../../core/models/room.model';
import { Billing } from '../../core/models/billing.model';
import { UiCardComponent } from '../../shared/ui/ui-card/ui-card.component';
import { UiTableComponent } from '../../shared/ui/ui-table/ui-table.component';
import { UiLoaderComponent } from '../../shared/ui/ui-loader/ui-loader.component';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink, UiCardComponent, UiTableComponent, UiLoaderComponent],
  template: `
    <div class="space-y-8">
      <!-- Welcome Header -->
      <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 class="text-xl md:text-2xl font-black text-slate-900 tracking-tight">
            Welcome back, {{ user()?.name }}
          </h2>
          <p class="text-xs text-slate-500 mt-1">
            @if (isAdmin()) {
              Manage reservations, rooms, billing, and system operations.
            } @else {
              Book stays, view invoice details, track history, and file complaints.
            }
          </p>
        </div>

        <div>
          @if (isAdmin()) {
            <a 
              routerLink="/reservation" 
              class="inline-flex items-center gap-2 px-4 py-2.5 bg-slate-950 text-white rounded-lg text-xs font-semibold hover:bg-slate-800 transition-colors shadow-premium"
            >
              Manage Reservations
            </a>
          } @else {
            <a 
              routerLink="/reservation" 
              class="inline-flex items-center gap-2 px-4 py-2.5 bg-brand-blue text-white rounded-lg text-xs font-semibold hover:bg-brand-blue-hover transition-colors shadow-premium"
            >
              Book New Stay
            </a>
          }
        </div>
      </div>

      @if (isLoading()) {
        <!-- Skeleton loaders -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
          <app-ui-loader type="skeleton-card"></app-ui-loader>
          <app-ui-loader type="skeleton-card"></app-ui-loader>
          <app-ui-loader type="skeleton-card"></app-ui-loader>
        </div>
        <div class="mt-6">
          <app-ui-loader type="skeleton-table"></app-ui-loader>
        </div>
      } @else {
        <!-- Stats Grid -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          <!-- Card 1: Active Bookings -->
          <app-ui-card title="Active Bookings">
            <div class="flex items-baseline justify-between mt-1">
              <span class="text-3xl font-bold text-slate-950 tracking-tight">{{ activeBookingsCount() }}</span>
              <span class="text-xxs font-mono uppercase tracking-widest font-bold px-2 py-0.5 rounded bg-brand-blue/10 text-brand-blue">
                Confirmed
              </span>
            </div>
            <p class="text-xs text-slate-400 mt-2">
              @if (isAdmin()) { Current occupied or incoming reservations } @else { Your upcoming stays }
            </p>
          </app-ui-card>

          <!-- Card 2: Payment Summary -->
          <app-ui-card title="Payments Summary">
            <div class="flex items-baseline justify-between mt-1">
              <span class="text-3xl font-bold text-slate-950 tracking-tight">
                &#36;{{ paymentsSum() }}
              </span>
              <span class="text-xxs font-mono uppercase tracking-widest font-bold px-2 py-0.5 rounded"
                [ngClass]="isAdmin() ? 'bg-emerald-50 text-emerald-600' : (paymentsSum() > 0 ? 'bg-orange-50 text-orange-600' : 'bg-slate-100 text-slate-500')">
                {{ isAdmin() ? 'Collected' : 'Due Amount' }}
              </span>
            </div>
            <p class="text-xs text-slate-400 mt-2">
              @if (isAdmin()) { Cumulative revenue from paid reservations } @else { Outstanding bills needing payment }
            </p>
          </app-ui-card>

          <!-- Card 3: Room Availability -->
          <app-ui-card title="Room Availability">
            <div class="flex items-baseline justify-between mt-1">
              <span class="text-3xl font-bold text-slate-950 tracking-tight">
                {{ vacantRoomsCount() }} / {{ totalRoomsCount() }}
              </span>
              <span class="text-xxs font-mono uppercase tracking-widest font-bold px-2 py-0.5 rounded bg-slate-900 text-white">
                {{ availabilityPercent() }}% Free
              </span>
            </div>
            <p class="text-xs text-slate-400 mt-2">
              @if (isAdmin()) { Rooms clean and ready to occupy } @else { Total room categories available for bookings }
            </p>
          </app-ui-card>

        </div>

        <!-- Recent Reservations Section -->
        <div class="space-y-4">
          <div class="flex items-center justify-between">
            <h3 class="text-xs font-mono uppercase tracking-widest text-slate-400 font-bold">Recent Reservations</h3>
            <a routerLink="/bookings" class="text-xs font-bold text-brand-blue hover:underline">View All Bookings</a>
          </div>

          <app-ui-table 
            [columns]="tableColumns" 
            [data]="recentReservations()" 
            [cellTemplate]="cellTpl"
          ></app-ui-table>

          <ng-template #cellTpl let-row let-col="column" let-val="val">
            @if (col.key === 'id') {
              <span class="font-mono font-bold text-slate-900">{{ val }}</span>
            } @else if (col.key === 'dates') {
              <span class="text-xs text-slate-600 font-medium">{{ row.checkIn }} to {{ row.checkOut }}</span>
            } @else if (col.key === 'roomNumber') {
              @if (val) {
                <span class="font-semibold text-slate-900 bg-slate-100 px-2 py-0.5 rounded text-xs">Room {{ val }}</span>
              } @else {
                <span class="text-slate-400 italic text-xs">Not Assigned</span>
              }
            } @else if (col.key === 'totalAmount') {
              <span class="font-semibold text-slate-900">&#36;{{ val }}</span>
            } @else if (col.key === 'status') {
              <span class="inline-block text-xxs font-bold uppercase tracking-wider px-2 py-0.5 rounded font-mono"
                [ngClass]="{
                  'bg-yellow-50 text-yellow-600 border border-yellow-100': val === 'PENDING',
                  'bg-emerald-50 text-emerald-600 border border-emerald-100': val === 'APPROVED',
                  'bg-red-50 text-red-600 border border-red-100': val === 'REJECTED'
                }">
                {{ val }}
              </span>
            } @else {
              <span class="font-medium text-slate-800">{{ val }}</span>
            }
          </ng-template>
        </div>
      }
    </div>
  `
})
export class DashboardComponent implements OnInit {
  private authService = inject(AuthService);
  private resService = inject(ReservationService);
  private roomService = inject(RoomService);
  private billingService = inject(BillingService);

  // States
  isLoading = signal<boolean>(true);
  user = this.authService.currentUser;
  isAdmin = computed(() => this.authService.isAdmin());

  reservations = signal<Reservation[]>([]);
  rooms = signal<Room[]>([]);
  billings = signal<Billing[]>([]);

  // Columns for dynamic tables
  tableColumns = [
    { key: 'id', label: 'Reservation ID' },
    { key: 'customerName', label: 'Guest Name' },
    { key: 'dates', label: 'Stay Dates' },
    { key: 'roomType', label: 'Room Preference' },
    { key: 'roomNumber', label: 'Assigned Room' },
    { key: 'totalAmount', label: 'Amount' },
    { key: 'status', label: 'Status' }
  ];

  // Computations
  activeBookingsCount = computed(() => {
    const list = this.reservations();
    const isAdmin = this.isAdmin();
    const currentUserId = this.user()?.id;

    return list.filter(r => {
      const matchStatus = r.status === 'APPROVED';
      const matchUser = isAdmin || String(r.customerId) === String(currentUserId);
      return matchStatus && matchUser;
    }).length;
  });

  paymentsSum = computed(() => {
    const bills = this.billings();
    const isAdmin = this.isAdmin();
    const currentUserId = this.user()?.id;

    if (isAdmin) {
      // Admin sees total revenue collected
      return bills
        .filter(b => b.isPaid)
        .reduce((sum, b) => sum + b.totalAmount, 0);
    } else {
      // Customer sees total outstanding payment (unpaid bills)
      return bills
        .filter(b => String(b.customerId) === String(currentUserId) && !b.isPaid)
        .reduce((sum, b) => sum + b.totalAmount, 0);
    }
  });

  vacantRoomsCount = computed(() => {
    return this.rooms().filter(rm => rm.status === 'VACANT').length;
  });

  totalRoomsCount = computed(() => {
    return this.rooms().length;
  });

  availabilityPercent = computed(() => {
    const total = this.totalRoomsCount();
    if (total === 0) return 0;
    return Math.round((this.vacantRoomsCount() / total) * 100);
  });

  recentReservations = computed(() => {
    const list = this.reservations();
    const isAdmin = this.isAdmin();
    const currentUserId = this.user()?.id;

    const filtered = list.filter(r => isAdmin || String(r.customerId) === String(currentUserId));
    // Sort by reservation ID or booking date descending (simulated)
    return filtered.slice(-5).reverse();
  });

  ngOnInit(): void {
    this.loadDashboardData();
  }

  loadDashboardData(): void {
    this.isLoading.set(true);

    forkJoin({
      reservations: this.resService.getReservations(),
      rooms: this.roomService.getRooms(),
      billings: this.billingService.getAllInvoices()
    }).subscribe({
      next: (data) => {
        this.reservations.set(data.reservations);
        this.rooms.set(data.rooms);
        this.billings.set(data.billings);
        this.isLoading.set(false);
      },
      error: () => {
        this.isLoading.set(false);
      }
    });
  }
}
