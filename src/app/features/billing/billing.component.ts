import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { forkJoin, of } from 'rxjs';
import { AuthService } from '../../core/services/auth.service';
import { BillingService } from '../../core/services/billing.service';
import { ReservationService } from '../../core/services/reservation.service';
import { Billing } from '../../core/models/billing.model';
import { Reservation } from '../../core/models/reservation.model';
import { UiCardComponent } from '../../shared/ui/ui-card/ui-card.component';
import { UiTableComponent } from '../../shared/ui/ui-table/ui-table.component';
import { UiLoaderComponent } from '../../shared/ui/ui-loader/ui-loader.component';
import { UiModalComponent } from '../../shared/ui/ui-modal/ui-modal.component';

@Component({
  selector: 'app-billing',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, UiCardComponent, UiTableComponent, UiLoaderComponent, UiModalComponent],
  template: `
    <div class="space-y-6">
      
      <!-- Welcome Header -->
      <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 class="text-xl md:text-2xl font-black text-slate-900 tracking-tight">
            {{ isAdmin() ? 'Invoice Management' : 'My Invoices & Billing' }}
          </h2>
          <p class="text-xs text-slate-500 mt-1">
            {{ isAdmin() ? 'Search client invoices, generate new bills, and export records.' : 'Review room charges, extra service breakdowns, and complete payments.' }}
          </p>
        </div>
      </div>

      <!-- Admin Actions / Customer Lists -->
      @if (isAdmin()) {
        <!-- ADMIN INTERFACE -->
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          <!-- Column 1 & 2: Search & Tables -->
          <div class="lg:col-span-2 space-y-6">
            <app-ui-card title="Search Invoices">
              <div class="flex gap-2">
                <div class="relative flex-1">
                  <input 
                    type="text" 
                    [(ngModel)]="searchQuery"
                    placeholder="Search by Guest ID (e.g. USR-7734) or Reservation ID..."
                    class="block w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs md:text-sm placeholder-slate-400 focus:outline-none focus:border-brand-blue focus:ring-1 focus:ring-brand-blue transition-colors"
                  />
                </div>
                <button 
                  (click)="filterInvoices()"
                  class="px-4 py-2 bg-slate-950 text-white hover:bg-slate-800 rounded-lg text-xs font-semibold focus:outline-none transition-colors"
                >
                  Filter
                </button>
                @if (searchQuery) {
                  <button 
                    (click)="clearSearch()"
                    class="px-3 py-2 border border-slate-200 hover:bg-slate-50 text-slate-500 rounded-lg text-xs font-semibold transition-colors"
                  >
                    Clear
                  </button>
                }
              </div>
            </app-ui-card>

            <div class="space-y-4">
              <h3 class="text-xs font-mono uppercase tracking-widest text-slate-400 font-bold">Billing Records</h3>
              @if (isLoading()) {
                <app-ui-loader type="skeleton-table"></app-ui-loader>
              } @else {
                <app-ui-table 
                  [columns]="adminColumns" 
                  [data]="filteredInvoices()" 
                  [cellTemplate]="adminCellTpl"
                ></app-ui-table>

                <ng-template #adminCellTpl let-row let-col="column" let-val="val">
                  @if (col.key === 'id') {
                    <span class="font-mono font-bold text-slate-900">{{ val }}</span>
                  } @else if (col.key === 'reservationId') {
                    <span class="font-mono text-slate-500 text-xs">{{ val }}</span>
                  } @else if (col.key === 'totalAmount') {
                    <span class="font-bold text-slate-900">&#36;{{ val }}</span>
                  } @else if (col.key === 'isPaid') {
                    <span class="inline-block text-[10px] font-bold px-2 py-0.5 rounded-full font-mono"
                      [ngClass]="val ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'">
                      {{ val ? 'PAID' : 'UNPAID' }}
                    </span>
                  } @else if (col.key === 'action') {
                    <div class="flex gap-2">
                      <button 
                        (click)="viewInvoiceDetails(row)" 
                        class="px-2 py-1 border border-slate-200 hover:bg-slate-50 text-slate-800 rounded font-semibold text-xxs tracking-wider uppercase transition-colors"
                      >
                        Details
                      </button>
                      <button 
                        (click)="downloadInvoicePDF(row)" 
                        class="px-2 py-1 bg-brand-blue hover:bg-brand-blue-hover text-white rounded font-semibold text-xxs tracking-wider uppercase transition-colors"
                      >
                        Download
                      </button>
                    </div>
                  } @else {
                    <span class="font-medium text-slate-800">{{ val }}</span>
                  }
                </ng-template>
              }
            </div>
          </div>

          <!-- Column 3: Generate Invoice Form -->
          <div class="lg:col-span-1">
            <app-ui-card title="Generate New Invoice">
              <div class="space-y-4">
                <p class="text-xs text-slate-400">
                  Generate billing receipts for guest reservations.
                </p>
                <div>
                  <label for="resSelect" class="block text-xs font-bold text-slate-700 uppercase tracking-wide">Approved Reservation ID</label>
                  <select 
                    id="resSelect" 
                    [(ngModel)]="selectedResIdForInvoice"
                    class="mt-1 block w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs md:text-sm focus:outline-none focus:border-brand-blue focus:ring-1 focus:ring-brand-blue transition-colors font-mono"
                  >
                    <option value="">-- Select Reservation --</option>
                    @for (res of unbilledReservations(); track res.id) {
                      <option [value]="res.id">{{ res.id }} - {{ res.customerName }} ({{ res.roomType }})</option>
                    }
                  </select>
                </div>
                <button 
                  (click)="generateInvoice()"
                  [disabled]="!selectedResIdForInvoice || isGenerating()"
                  class="w-full py-2.5 px-4 bg-slate-950 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold disabled:opacity-40 disabled:cursor-not-allowed focus:outline-none transition-colors"
                >
                  @if (isGenerating()) {
                    <div class="inline-block animate-spin rounded-full h-3 w-3 border-2 border-slate-400 border-t-white mr-1.5"></div>
                  }
                  Generate Invoice
                </button>
              </div>
            </app-ui-card>
          </div>

        </div>
      } @else {
        <!-- CUSTOMER INTERFACE -->
        <div class="space-y-6">
          @if (isLoading()) {
            <app-ui-loader type="skeleton-table"></app-ui-loader>
          } @else {
            <app-ui-table 
              [columns]="customerColumns" 
              [data]="myInvoices()" 
              [cellTemplate]="custCellTpl"
            ></app-ui-table>

            <ng-template #custCellTpl let-row let-col="column" let-val="val">
              @if (col.key === 'id') {
                <span class="font-mono font-bold text-slate-900">{{ val }}</span>
              } @else if (col.key === 'reservationId') {
                <span class="font-mono text-slate-500 text-xs">{{ val }}</span>
              } @else if (col.key === 'totalAmount') {
                <span class="font-bold text-slate-900">&#36;{{ val }}</span>
              } @else if (col.key === 'isPaid') {
                <span class="inline-block text-[10px] font-bold px-2 py-0.5 rounded-full font-mono"
                  [ngClass]="val ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'">
                  {{ val ? 'PAID' : 'UNPAID' }}
                </span>
              } @else if (col.key === 'action') {
                <div class="flex gap-2">
                  <button 
                    (click)="viewInvoiceDetails(row)" 
                    class="px-2.5 py-1 border border-slate-200 hover:bg-slate-50 text-slate-800 rounded font-semibold text-xxs tracking-wider uppercase transition-colors"
                  >
                    View Details
                  </button>
                  @if (!row.isPaid) {
                    <a 
                      [routerLink]="['/payment']" 
                      [queryParams]="{ resId: row.reservationId }"
                      class="px-2.5 py-1 bg-brand-blue hover:bg-brand-blue-hover text-white rounded font-semibold text-xxs tracking-wider uppercase transition-colors"
                    >
                      Pay Now
                    </a>
                  }
                </div>
              } @else {
                <span class="font-medium text-slate-800">{{ val }}</span>
              }
            </ng-template>
          }
        </div>
      }

      <!-- Shared Invoice Details Modal -->
      <app-ui-modal 
        [isOpen]="isModalOpen()" 
        [title]="'Invoice details: ' + activeInvoice()?.id" 
        (onClose)="closeModal()"
      >
        @if (activeInvoice()) {
          <div class="space-y-5">
            <!-- Summary Headers -->
            <div class="flex justify-between border-b border-slate-100 pb-4">
              <div>
                <p class="text-xxs font-mono uppercase text-slate-400 font-bold">Billing Status</p>
                <span class="inline-block text-xs font-bold px-2.5 py-0.5 rounded-full font-mono mt-1"
                  [ngClass]="activeInvoice()?.isPaid ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'">
                  {{ activeInvoice()?.isPaid ? 'PAID' : 'UNPAID' }}
                </span>
              </div>
              <div class="text-right">
                <p class="text-xxs font-mono uppercase text-slate-400 font-bold">Reservation ID</p>
                <p class="font-mono font-bold text-slate-800 mt-1">{{ activeInvoice()?.reservationId }}</p>
              </div>
            </div>

            <!-- Itemized breakdown -->
            <div class="space-y-3">
              <h4 class="text-xs font-bold uppercase text-slate-500 tracking-wider">Charges Breakdown</h4>
              <div class="space-y-2 border border-slate-100 rounded-xl p-4 bg-slate-50/20 text-xs">
                <div class="flex justify-between">
                  <span class="text-slate-500">Room Charges</span>
                  <span class="font-mono font-semibold text-slate-800">&#36;{{ activeInvoice()?.roomCharges }}</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-slate-500">Extra Services (Room Service, Mini Bar)</span>
                  <span class="font-mono font-semibold text-slate-800">&#36;{{ activeInvoice()?.extraServices }}</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-slate-500">Taxes & Fees (8%)</span>
                  <span class="font-mono font-semibold text-slate-800">&#36;{{ activeInvoice()?.tax }}</span>
                </div>
                <div class="border-t border-slate-100 pt-2 flex justify-between font-bold text-sm">
                  <span class="text-slate-800">Total Amount due</span>
                  <span class="font-mono text-brand-blue">&#36;{{ activeInvoice()?.totalAmount }}</span>
                </div>
              </div>
            </div>

            <!-- Transaction Detail (If Paid) -->
            @if (activeInvoice()?.isPaid) {
              <div class="border-t border-slate-100 pt-4 bg-slate-50/50 p-4 rounded-xl space-y-2 text-xs">
                <h4 class="text-xs font-bold uppercase text-slate-600 tracking-wide mb-1">Receipt Details</h4>
                <div class="flex justify-between">
                  <span class="text-slate-400">Payment Date</span>
                  <span class="font-semibold text-slate-700">{{ activeInvoice()?.paymentDate }}</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-slate-400">Method</span>
                  <span class="font-semibold text-slate-700 font-mono">{{ activeInvoice()?.cardMasked }}</span>
                </div>
              </div>
            }

            <!-- Download option in modal footer -->
            <div class="flex justify-end gap-2 pt-4 border-t border-slate-100" modal-footer>
              <button 
                (click)="closeModal()"
                class="px-4 py-2 border border-slate-200 text-slate-700 hover:bg-slate-50 rounded-lg text-xs font-semibold transition-colors"
              >
                Close
              </button>
              <button 
                (click)="downloadInvoicePDF(activeInvoice()!)"
                class="px-4 py-2 bg-slate-950 text-white hover:bg-slate-800 rounded-lg text-xs font-semibold transition-colors"
              >
                Download Invoice
              </button>
            </div>

          </div>
        }
      </app-ui-modal>

    </div>
  `
})
export class BillingComponent implements OnInit {
  private authService = inject(AuthService);
  private billingService = inject(BillingService);
  private resService = inject(ReservationService);

  // States
  isLoading = signal<boolean>(true);
  isGenerating = signal<boolean>(false);
  
  user = this.authService.currentUser;
  isAdmin = computed(() => this.authService.isAdmin());

  // Collections
  invoices = signal<Billing[]>([]);
  reservations = signal<Reservation[]>([]);

  // Search filter query
  searchQuery = '';
  filteredInvoices = signal<Billing[]>([]);

  // Generator selector
  selectedResIdForInvoice = '';

  // Modal State
  isModalOpen = signal<boolean>(false);
  activeInvoice = signal<Billing | null>(null);

  // Columns Configuration
  customerColumns = [
    { key: 'id', label: 'Invoice ID' },
    { key: 'reservationId', label: 'Reservation ID' },
    { key: 'totalAmount', label: 'Amount Due' },
    { key: 'isPaid', label: 'Status' },
    { key: 'action', label: 'Action' }
  ];

  adminColumns = [
    { key: 'id', label: 'Invoice ID' },
    { key: 'customerId', label: 'Guest ID' },
    { key: 'reservationId', label: 'Reservation ID' },
    { key: 'totalAmount', label: 'Amount Due' },
    { key: 'isPaid', label: 'Status' },
    { key: 'action', label: 'Action' }
  ];

  // Computed listings
  myInvoices = computed(() => {
    const list = this.invoices();
    const currentUserId = this.user()?.id;
    return list.filter(b => String(b.customerId) === String(currentUserId));
  });

  unbilledReservations = computed(() => {
    const resList = this.reservations();
    const invList = this.invoices();

    // Filter approved reservations that do NOT have a billing entry yet
    return resList.filter(res => {
      const hasBill = invList.some(inv => inv.reservationId === res.id);
      return res.status === 'APPROVED' && !hasBill;
    });
  });

  ngOnInit(): void {
    this.loadBillingData();
  }

  loadBillingData(): void {
    this.isLoading.set(true);
    
    this.billingService.getAllInvoices().subscribe({
      next: (invList) => {
        this.invoices.set(invList);
        this.filteredInvoices.set(invList);
        
        if (this.isAdmin()) {
          this.resService.getReservations().subscribe({
            next: (resList) => {
              this.reservations.set(resList);
              this.isLoading.set(false);
            },
            error: () => this.isLoading.set(false)
          });
        } else {
          this.isLoading.set(false);
        }
      },
      error: () => {
        this.isLoading.set(false);
      }
    });
  }

  filterInvoices(): void {
    const query = this.searchQuery.trim().toLowerCase();
    if (!query) {
      this.filteredInvoices.set(this.invoices());
      return;
    }

    const filtered = this.invoices().filter(inv => 
      inv.id.toLowerCase().includes(query) || 
      inv.customerId.toLowerCase().includes(query) ||
      inv.reservationId.toLowerCase().includes(query)
    );
    this.filteredInvoices.set(filtered);
  }

  clearSearch(): void {
    this.searchQuery = '';
    this.filteredInvoices.set(this.invoices());
  }

  generateInvoice(): void {
    if (!this.selectedResIdForInvoice) return;

    this.isGenerating.set(true);
    this.billingService.generateInvoice(this.selectedResIdForInvoice).subscribe({
      next: () => {
        this.isGenerating.set(false);
        this.selectedResIdForInvoice = '';
        this.loadBillingData(); // Reload invoices
      },
      error: () => {
        this.isGenerating.set(false);
      }
    });
  }

  viewInvoiceDetails(invoice: Billing): void {
    this.activeInvoice.set(invoice);
    this.isModalOpen.set(true);
  }

  closeModal(): void {
    this.isModalOpen.set(false);
    this.activeInvoice.set(null);
  }

  downloadInvoicePDF(invoice: Billing): void {
    // Generate text content for a mock invoice PDF
    const text = `
========================================
       The Shivalik GRAND HOTEL & RESIDENCES
             INVOICE RECEIPT
========================================
Invoice ID     : ${invoice.id}
Reservation ID : ${invoice.reservationId}
Customer ID    : ${invoice.customerId}
Date Generated : ${new Date().toISOString().split('T')[0]}
Status         : ${invoice.isPaid ? 'PAID' : 'UNPAID'}

----------------------------------------
ITEMIZED CHARGES
----------------------------------------
Room Charges   : \$${invoice.roomCharges.toFixed(2)}
Extra Services : \$${invoice.extraServices.toFixed(2)}
Tax (8%)       : \$${invoice.tax.toFixed(2)}
----------------------------------------
TOTAL AMOUNT   : \$${invoice.totalAmount.toFixed(2)}
----------------------------------------

${invoice.isPaid ? `Payment Received:
Date           : ${invoice.paymentDate}
Method         : Card Ending in ${invoice.cardMasked?.slice(-4)}` : 'PAYMENT IS DUE UPON CHECK-OUT.'}

Thank you for choosing The Shivalik. We hope to serve you again!
========================================
`;
    
    // Trigger download of this mock invoice as a text file
    const blob = new Blob([text], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Invoice_${invoice.id}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  }
}
