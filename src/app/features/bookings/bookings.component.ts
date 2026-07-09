import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { ReservationService } from '../../core/services/reservation.service';
import { Reservation } from '../../core/models/reservation.model';
import { UiCardComponent } from '../../shared/ui/ui-card/ui-card.component';
import { UiTableComponent } from '../../shared/ui/ui-table/ui-table.component';
import { UiLoaderComponent } from '../../shared/ui/ui-loader/ui-loader.component';

@Component({
  selector: 'app-bookings',
  standalone: true,
  imports: [CommonModule, RouterLink, UiCardComponent, UiTableComponent, UiLoaderComponent],
  template: `
    <div class="space-y-6">
      
      <!-- Welcome Header -->
      <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 class="text-xl md:text-2xl font-black text-slate-900 tracking-tight">
            {{ isAdmin() ? 'Master Schedule: Upcoming Bookings' : 'My Scheduled Stays' }}
          </h2>
          <p class="text-xs text-slate-500 mt-1">
            {{ isAdmin() ? 'Track pending and approved check-ins scheduled for room arrivals.' : 'View status progress, assigned rooms, and dates for your next stays.' }}
          </p>
        </div>
      </div>

      <!-- Bookings Table/Cards -->
      <div class="space-y-4">
        <h3 class="text-xs font-mono uppercase tracking-widest text-slate-400 font-bold">Upcoming Stays Schedule</h3>
        
        @if (isLoading()) {
          <app-ui-loader type="skeleton-table"></app-ui-loader>
        } @else {
          <app-ui-table 
            [columns]="tableColumns" 
            [data]="upcomingStays()" 
            [cellTemplate]="cellTpl"
          ></app-ui-table>

          <ng-template #cellTpl let-row let-col="column" let-val="val">
            @if (col.key === 'id') {
              <span class="font-mono font-bold text-slate-900">{{ val }}</span>
            } @else if (col.key === 'dates') {
              <span class="text-xs text-slate-700 font-medium">{{ row.checkIn }} to {{ row.checkOut }}</span>
            } @else if (col.key === 'roomNumber') {
              @if (val) {
                <span class="font-semibold text-slate-900 bg-slate-100 px-2 py-0.5 rounded text-xs font-mono">Room {{ val }}</span>
              } @else {
                <span class="text-slate-400 italic text-xs">Awaiting Assign</span>
              }
            } @else if (col.key === 'totalAmount') {
              <span class="font-bold text-slate-900 font-mono">\${{ val }}</span>
            } @else if (col.key === 'status') {
              <span class="inline-block text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded font-mono"
                [ngClass]="{
                  'bg-yellow-50 text-yellow-600 border border-yellow-100': val === 'PENDING',
                  'bg-emerald-50 text-emerald-600 border border-emerald-100': val === 'APPROVED',
                  'bg-red-50 text-red-600 border border-red-100': val === 'REJECTED'
                }">
                {{ val }}
              </span>
            } @else if (col.key === 'action') {
              <div class="flex gap-2">
                @if (row.status === 'APPROVED') {
                  <a 
                    [routerLink]="['/billing']"
                    class="px-2.5 py-1 border border-slate-200 hover:bg-slate-50 text-slate-800 rounded font-semibold text-xxs tracking-wider uppercase transition-colors"
                  >
                    Billing Detail
                  </a>
                } @else if (row.status === 'PENDING' && !isAdmin()) {
                  <span class="text-xxs text-slate-400 italic font-medium">Under Review</span>
                } @else if (row.status === 'PENDING' && isAdmin()) {
                  <a 
                    routerLink="/reservation"
                    class="px-2.5 py-1 bg-slate-950 text-white hover:bg-slate-800 rounded font-semibold text-xxs tracking-wider uppercase transition-colors"
                  >
                    Review Request
                  </a>
                }
              </div>
            } @else {
              <span class="font-medium text-slate-800">{{ val }}</span>
            }
          </ng-template>
        }
      </div>

    </div>
  `
})
export class BookingsComponent implements OnInit {
  private authService = inject(AuthService);
  private resService = inject(ReservationService);

  // States
  isLoading = signal<boolean>(true);
  user = this.authService.currentUser;
  isAdmin = computed(() => this.authService.isAdmin());

  // Collections
  reservations = signal<Reservation[]>([]);

  // Columns config
  tableColumns = [
    { key: 'id', label: 'Booking ID' },
    { key: 'customerName', label: 'Guest Name' },
    { key: 'dates', label: 'Stay Duration' },
    { key: 'roomType', label: 'Category' },
    { key: 'roomNumber', label: 'Assigned Room' },
    { key: 'totalAmount', label: 'Price' },
    { key: 'status', label: 'Status' },
    { key: 'action', label: 'Action' }
  ];

  // Computed filter
  upcomingStays = computed(() => {
    const list = this.reservations();
    const admin = this.isAdmin();
    const currentUserId = this.user()?.id;

    // Filter out REJECTED ones, show pending or approved stays
    const filtered = list.filter(r => {
      const matchStatus = r.status !== 'REJECTED';
      const matchUser = admin || String(r.customerId) === String(currentUserId);
      return matchStatus && matchUser;
    });

    // Sort by check-in date ascending
    return [...filtered].sort((a, b) => new Date(a.checkIn).getTime() - new Date(b.checkIn).getTime());
  });

  ngOnInit(): void {
    this.loadBookings();
  }

  loadBookings(): void {
    this.isLoading.set(true);
    this.resService.getReservations().subscribe({
      next: (data) => {
        this.reservations.set(data);
        this.isLoading.set(false);
      },
      error: () => this.isLoading.set(false)
    });
  }
}
