import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { HistoryService } from '../../core/services/history.service';
import { Reservation } from '../../core/models/reservation.model';
import { UiCardComponent } from '../../shared/ui/ui-card/ui-card.component';
import { UiTableComponent } from '../../shared/ui/ui-table/ui-table.component';
import { UiLoaderComponent } from '../../shared/ui/ui-loader/ui-loader.component';

@Component({
  selector: 'app-history',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, UiCardComponent, UiTableComponent, UiLoaderComponent],
  template: `
    <div class="space-y-6">
      
      <!-- Welcome Header -->
      <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 class="text-xl md:text-2xl font-black text-slate-900 tracking-tight">
            {{ isAdmin() ? 'Universal Stay Archives' : 'My Stay History' }}
          </h2>
          <p class="text-xs text-slate-500 mt-1">
            {{ isAdmin() ? 'Search and audit historical reservation records across the whole system.' : 'Browse details of your past check-ins, check-outs, and bills.' }}
          </p>
        </div>
      </div>

      <!-- Admin User Search Panel -->
      @if (isAdmin()) {
        <app-ui-card title="Search Stay History by Guest ID">
          <div class="flex gap-2">
            <div class="relative flex-1">
              <input 
                type="text" 
                [(ngModel)]="searchUserId"
                placeholder="Enter Guest User ID (e.g. USR-7734)..."
                class="block w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs md:text-sm placeholder-slate-400 focus:outline-none focus:border-brand-blue focus:ring-1 focus:ring-brand-blue transition-colors font-mono"
              />
            </div>
            <button 
              (click)="triggerSearch()"
              class="px-4 py-2 bg-slate-950 text-white hover:bg-slate-800 rounded-lg text-xs font-semibold focus:outline-none transition-colors"
            >
              Search
            </button>
            @if (searchUserId || hasSearched()) {
              <button 
                (click)="clearSearch()"
                class="px-3 py-2 border border-slate-200 hover:bg-slate-50 text-slate-500 rounded-lg text-xs font-semibold transition-colors"
              >
                Clear
              </button>
            }
          </div>
        </app-ui-card>
      }

      <!-- History Table Listing -->
      <div class="space-y-4">
        <h3 class="text-xs font-mono uppercase tracking-widest text-slate-400 font-bold">
          {{ hasSearched() ? 'Search Results for ' + searchUserId : 'All History Records' }}
        </h3>

        @if (isLoading()) {
          <app-ui-loader type="skeleton-table"></app-ui-loader>
        } @else {
          <app-ui-table 
            [columns]="tableColumns" 
            [data]="historyRecords()" 
            [cellTemplate]="cellTpl"
          ></app-ui-table>

          <ng-template #cellTpl let-row let-col="column" let-val="val">
            @if (col.key === 'id') {
              <span class="font-mono font-bold text-slate-900">{{ val }}</span>
            } @else if (col.key === 'bookingDate') {
              <span class="text-xs text-slate-600 font-mono">{{ val }}</span>
            } @else if (col.key === 'dates') {
              <span class="text-xs text-slate-700 font-medium">{{ row.checkIn }} to {{ row.checkOut }}</span>
            } @else if (col.key === 'roomNumber') {
              @if (val) {
                <span class="font-semibold text-slate-900 bg-slate-100 px-2 py-0.5 rounded text-xs font-mono">Room {{ val }}</span>
              } @else {
                <span class="text-slate-400 italic text-xs">Not Assigned</span>
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
            } @else {
              <span class="font-medium text-slate-800">{{ val }}</span>
            }
          </ng-template>
        }
      </div>

    </div>
  `
})
export class HistoryComponent implements OnInit {
  private authService = inject(AuthService);
  private historyService = inject(HistoryService);

  // States
  isLoading = signal<boolean>(true);
  user = this.authService.currentUser;
  isAdmin = computed(() => this.authService.isAdmin());

  // Collections
  historyRecords = signal<Reservation[]>([]);

  // Search details
  searchUserId = '';
  hasSearched = signal<boolean>(false);

  // Table Setup
  tableColumns = [
    { key: 'id', label: 'Reservation ID' },
    { key: 'bookingDate', label: 'Booking Date' },
    { key: 'dates', label: 'Stay Duration' },
    { key: 'roomType', label: 'Category' },
    { key: 'roomNumber', label: 'Room' },
    { key: 'totalAmount', label: 'Bill Amount' },
    { key: 'status', label: 'Status' }
  ];

  ngOnInit(): void {
    this.loadHistory();
  }

  loadHistory(): void {
    this.isLoading.set(true);
    if (this.isAdmin()) {
      // Load all by default for admin
      this.historyService.getAllHistory().subscribe({
        next: (data) => {
          this.historyRecords.set(data);
          this.isLoading.set(false);
        },
        error: () => this.isLoading.set(false)
      });
    } else {
      // Load for specific customer
      const currentUserId = this.user()?.id || '';
      this.historyService.getUserHistory(currentUserId).subscribe({
        next: (data) => {
          this.historyRecords.set(data);
          this.isLoading.set(false);
        },
        error: () => this.isLoading.set(false)
      });
    }
  }

  triggerSearch(): void {
    const targetId = this.searchUserId.trim();
    if (!targetId) {
      this.loadHistory();
      this.hasSearched.set(false);
      return;
    }

    this.isLoading.set(true);
    this.hasSearched.set(true);
    this.historyService.getUserHistory(targetId).subscribe({
      next: (data) => {
        this.historyRecords.set(data);
        this.isLoading.set(false);
      },
      error: () => {
        this.historyRecords.set([]);
        this.isLoading.set(false);
      }
    });
  }

  clearSearch(): void {
    this.searchUserId = '';
    this.hasSearched.set(false);
    this.loadHistory();
  }
}
