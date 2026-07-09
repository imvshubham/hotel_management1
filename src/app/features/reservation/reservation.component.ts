import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { ReservationService } from '../../core/services/reservation.service';
import { RoomService } from '../../core/services/room.service';
import { Reservation, ReservationStatus } from '../../core/models/reservation.model';
import { Room } from '../../core/models/room.model';
import { UiCardComponent } from '../../shared/ui/ui-card/ui-card.component';
import { UiTableComponent } from '../../shared/ui/ui-table/ui-table.component';
import { UiLoaderComponent } from '../../shared/ui/ui-loader/ui-loader.component';
import { UiModalComponent } from '../../shared/ui/ui-modal/ui-modal.component';
import { UiErrorComponent } from '../../shared/ui/ui-error/ui-error.component';

@Component({
  selector: 'app-reservation',
  standalone: true,
  imports: [
    CommonModule, 
    ReactiveFormsModule, 
    FormsModule,
    RouterLink,
    UiCardComponent, 
    UiTableComponent, 
    UiLoaderComponent, 
    UiModalComponent,
    UiErrorComponent
  ],
  template: `
    <div class="space-y-6">
      
      <!-- Welcome Header -->
      <div>
        <h2 class="text-xl md:text-2xl font-black text-slate-900 tracking-tight">
          {{ isAdmin() ? 'Reservations Control Center' : 'Book a New Stay' }}
        </h2>
        <p class="text-xs text-slate-500 mt-1">
          {{ isAdmin() ? 'Review guest booking requests, assign vacant rooms, and update status.' : 'Specify dates and select room preferences.' }}
        </p>
      </div>

      <!-- Main Action Frame -->
      @if (isAdmin()) {
        <!-- ADMIN INTERFACE: Pending Approval Table -->
        <div class="space-y-4">
          <div class="flex items-center justify-between">
            <h3 class="text-xs font-mono uppercase tracking-widest text-slate-400 font-bold">Pending Reservations</h3>
          </div>

          @if (isLoading()) {
            <app-ui-loader type="skeleton-table"></app-ui-loader>
          } @else {
            <app-ui-table 
              [columns]="adminColumns" 
              [data]="pendingReservations()" 
              [cellTemplate]="adminCellTpl"
            ></app-ui-table>

            <ng-template #adminCellTpl let-row let-col="column" let-val="val">
              @if (col.key === 'id') {
                <span class="font-mono font-bold text-slate-900">{{ val }}</span>
              } @else if (col.key === 'dates') {
                <span class="text-xs text-slate-600 font-medium">{{ row.checkIn }} to {{ row.checkOut }}</span>
              } @else if (col.key === 'totalAmount') {
                <span class="font-semibold text-slate-900">&#36;{{ val }}</span>
              } @else if (col.key === 'action') {
                <button 
                  (click)="openAssignModal(row)" 
                  class="px-2.5 py-1 bg-slate-950 text-white hover:bg-slate-800 rounded font-semibold text-xxs tracking-wider uppercase transition-colors"
                >
                  Manage / Assign
                </button>
              } @else {
                <span class="font-medium text-slate-800">{{ val }}</span>
              }
            </ng-template>
          }
        </div>

        <!-- Admin Assign Room Modal -->
        <app-ui-modal 
          [isOpen]="isModalOpen()" 
          [title]="'Review Booking ' + selectedRes()?.id" 
          (onClose)="closeModal()"
        >
          @if (selectedRes()) {
            <div class="space-y-4 text-xs md:text-sm">
              <div class="grid grid-cols-2 gap-4 border-b border-slate-100 pb-4">
                <div>
                  <p class="text-xxs font-mono uppercase text-slate-400 font-bold">Guest Name</p>
                  <p class="font-semibold text-slate-800">{{ selectedRes()?.customerName }}</p>
                </div>
                <div>
                  <p class="text-xxs font-mono uppercase text-slate-400 font-bold">Requested Category</p>
                  <p class="font-semibold text-brand-blue">{{ selectedRes()?.roomType }}</p>
                </div>
                <div>
                  <p class="text-xxs font-mono uppercase text-slate-400 font-bold">Stay Dates</p>
                  <p class="font-semibold text-slate-800">{{ selectedRes()?.checkIn }} to {{ selectedRes()?.checkOut }}</p>
                </div>
                <div>
                  <p class="text-xxs font-mono uppercase text-slate-400 font-bold">Total Bill</p>
                  <p class="font-semibold text-slate-800 font-mono">&#36;{{ selectedRes()?.totalAmount }}</p>
                </div>
              </div>

              <!-- Room Assignment Selector -->
              <div class="space-y-2">
                <label for="assignRoom" class="block text-xs font-bold text-slate-700 uppercase tracking-wide">Assign Vacant Room</label>
                @if (matchingRooms().length === 0) {
                  <p class="text-xs text-red-500 font-medium bg-red-50 p-2.5 rounded-lg border border-red-100">
                    No vacant rooms of type <strong>{{ selectedRes()?.roomType }}</strong> are currently available. Status update blocked.
                  </p>
                } @else {
                  <select 
                    id="assignRoom" 
                    [(ngModel)]="assignedRoomId" 
                    [ngModelOptions]="{standalone: true}"
                    class="block w-full px-3 py-2.5 bg-white border border-slate-200 rounded-lg text-xs md:text-sm focus:outline-none focus:border-brand-blue focus:ring-1 focus:ring-brand-blue transition-colors font-mono"
                  >
                    <option value="">-- Select Room Number --</option>
                    @for (rm of matchingRooms(); track rm.id) {
                      <option [value]="rm.id">Room {{ rm.id }} - Price: &#36;{{ rm.price }}/night (Status: {{ rm.status }})</option>
                    }
                  </select>
                }
              </div>

              <!-- Actions inside modal footer -->
              <div class="flex items-center gap-2 pt-4 border-t border-slate-100 justify-end" modal-footer>
                <button 
                  (click)="processReservation('REJECTED')" 
                  [disabled]="isUpdating()"
                  class="px-4 py-2 border border-red-200 text-red-600 hover:bg-red-50 rounded-lg text-xs font-semibold focus:outline-none transition-colors"
                >
                  Reject
                </button>
                <button 
                  (click)="processReservation('APPROVED')" 
                  [disabled]="isUpdating() || !assignedRoomId"
                  class="px-4 py-2 bg-brand-blue hover:bg-brand-blue-hover text-white rounded-lg text-xs font-semibold disabled:opacity-40 disabled:cursor-not-allowed focus:outline-none transition-colors"
                >
                  Approve & Assign Room
                </button>
              </div>
            </div>
          }
        </app-ui-modal>

      } @else {
        <!-- CUSTOMER INTERFACE: Booking Form -->
        @if (successState()) {
          <!-- Booking success acknowledgments -->
          <div class="max-w-md mx-auto text-center py-6 space-y-6">
            <div class="inline-flex items-center justify-center w-12 h-12 rounded-full bg-brand-blue/10 text-brand-blue">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            
            <div class="space-y-2">
              <h2 class="text-xl font-bold text-slate-900">Reservation Confirmed</h2>
              <p class="text-sm text-slate-500">Your stay details have been queued for room assignment.</p>
            </div>

            <div class="bg-slate-50 border border-slate-100 rounded-lg p-5 inline-block w-full">
              <p class="text-xs text-slate-400 font-mono uppercase tracking-wider mb-1">Reservation ID</p>
              <p class="text-xl font-mono font-bold text-brand-blue tracking-wider">{{ generatedResId() }}</p>
            </div>

            <p class="text-xs text-slate-400">Our front desk staff will assign a room and approve your booking shortly.</p>

            <div class="flex gap-2 justify-center pt-4">
              <a 
                routerLink="/dashboard" 
                class="flex-1 py-2.5 px-4 border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 focus:outline-none transition-colors"
              >
                Go to Dashboard
              </a>
              <a 
                [routerLink]="['/payment']" 
                [queryParams]="{ resId: generatedResId() }"
                class="flex-1 py-2.5 px-4 border border-transparent rounded-lg shadow-sm text-xs font-semibold text-white bg-slate-950 hover:bg-slate-800 focus:outline-none transition-colors text-center"
              >
                Proceed to Payment
              </a>
            </div>
          </div>
        } @else {
          <!-- Booking Form -->
          <div class="max-w-xl mx-auto">
            <app-ui-card title="Reservation Form">
              <form [formGroup]="bookingForm" (ngSubmit)="onBook()" class="space-y-5">
                
                <!-- Dates Grid -->
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label for="checkIn" class="block text-xs font-bold text-slate-700 uppercase tracking-wide">Check-In Date</label>
                    <input 
                      id="checkIn" 
                      type="date" 
                      formControlName="checkIn"
                      [min]="today"
                      (change)="calculateTotals()"
                      class="mt-1 block w-full px-3 py-2.5 bg-white border border-slate-200 rounded-lg text-xs md:text-sm focus:outline-none focus:border-brand-blue focus:ring-1 focus:ring-brand-blue transition-colors font-mono"
                    />
                    <app-ui-error [show]="isFieldInvalid('checkIn')" message="Check-in date is required."></app-ui-error>
                  </div>
                  <div>
                    <label for="checkOut" class="block text-xs font-bold text-slate-700 uppercase tracking-wide">Check-Out Date</label>
                    <input 
                      id="checkOut" 
                      type="date" 
                      formControlName="checkOut"
                      [min]="bookingForm.get('checkIn')?.value || today"
                      (change)="calculateTotals()"
                      class="mt-1 block w-full px-3 py-2.5 bg-white border border-slate-200 rounded-lg text-xs md:text-sm focus:outline-none focus:border-brand-blue focus:ring-1 focus:ring-brand-blue transition-colors font-mono"
                    />
                    <app-ui-error [show]="isFieldInvalid('checkOut')" message="Check-out date must be after check-in."></app-ui-error>
                  </div>
                </div>

                <!-- Room Type -->
                <div>
                  <label for="roomType" class="block text-xs font-bold text-slate-700 uppercase tracking-wide">Room Preference</label>
                  <select 
                    id="roomType" 
                    formControlName="roomType"
                    (change)="calculateTotals()"
                    class="mt-1 block w-full px-3 py-2.5 bg-white border border-slate-200 rounded-lg text-xs md:text-sm focus:outline-none focus:border-brand-blue focus:ring-1 focus:ring-brand-blue transition-colors"
                  >
                    @for (opt of roomTypeOptions; track opt.name) {
                      <option [value]="opt.name">{{ opt.name }} - &#36;{{ opt.rate }}/night</option>
                    }
                  </select>
                </div>

                <!-- Personal Details - PREFILLED & DISABLED -->
                <div class="space-y-4 border-t border-slate-100 pt-4 bg-slate-50/50 p-4 rounded-xl">
                  <h4 class="text-xs font-bold uppercase text-slate-500 tracking-wider">Guest Information</h4>
                  <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p class="text-xxs font-mono uppercase text-slate-400 font-bold">Contact Name</p>
                      <p class="font-semibold text-slate-800 text-xs md:text-sm">{{ user()?.name }}</p>
                    </div>
                    <div>
                      <p class="text-xxs font-mono uppercase text-slate-400 font-bold">Contact Email</p>
                      <p class="font-semibold text-slate-800 text-xs md:text-sm">{{ user()?.email }}</p>
                    </div>
                    <div>
                      <p class="text-xxs font-mono uppercase text-slate-400 font-bold">Mobile Number</p>
                      <p class="font-semibold text-slate-800 text-xs md:text-sm">{{ user()?.countryCode }} {{ user()?.mobileNumber }}</p>
                    </div>
                    <div>
                      <p class="text-xxs font-mono uppercase text-slate-400 font-bold">Address</p>
                      <p class="font-semibold text-slate-800 text-xs md:text-sm">{{ user()?.address }}</p>
                    </div>
                  </div>
                </div>

                <!-- Summary & Total Calculator -->
                <div class="border-t border-slate-100 pt-4 flex justify-between items-center bg-slate-50/30 p-4 rounded-xl">
                  <div>
                    <p class="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">Total Duration</p>
                    <p class="text-xs font-bold text-slate-800">{{ totalNights() }} night(s)</p>
                  </div>
                  <div class="text-right">
                    <p class="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">Estimated Charges</p>
                    <p class="text-lg font-black text-brand-blue font-mono">&#36;{{ estimatedAmount() }}</p>
                  </div>
                </div>

                <!-- Actions -->
                <div class="flex items-center gap-3 pt-2">
                  <button 
                    type="button" 
                    (click)="onReset()" 
                    class="flex-1 py-2.5 px-4 border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 focus:outline-none transition-colors"
                  >
                    Reset Form
                  </button>
                  <button 
                    type="submit" 
                    [disabled]="bookingForm.invalid || isSubmitting()"
                    class="flex-1 py-2.5 px-4 border border-transparent rounded-lg shadow-sm text-xs font-semibold text-white bg-slate-950 hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none transition-colors"
                  >
                    @if (isSubmitting()) {
                      <div class="inline-block animate-spin rounded-full h-3 w-3 border-2 border-slate-400 border-t-white mr-1.5"></div>
                    }
                    Confirm Reservation
                  </button>
                </div>

              </form>
            </app-ui-card>
          </div>
        }
      }
    </div>
  `
})
export class ReservationComponent implements OnInit {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private resService = inject(ReservationService);
  private roomService = inject(RoomService);

  // General States
  isLoading = signal<boolean>(true);
  isSubmitting = signal<boolean>(false);
  isUpdating = signal<boolean>(false);
  
  user = this.authService.currentUser;
  isAdmin = computed(() => this.authService.isAdmin());

  // Collections
  reservations = signal<Reservation[]>([]);
  rooms = signal<Room[]>([]);
  
  // Custom generated ID for success screen
  successState = signal<boolean>(false);
  generatedResId = signal<string>('');

  // Form setup
  bookingForm!: FormGroup;
  today = new Date().toISOString().split('T')[0];

  // Room config matching
  roomTypeOptions = [
    { name: 'Single Room', rate: 100 },
    { name: 'Double Room', rate: 150 },
    { name: 'Deluxe Suite', rate: 250 },
    { name: 'Executive Penthouse', rate: 500 }
  ];

  // Computations
  totalNights = signal<number>(0);
  estimatedAmount = signal<number>(0);

  // Admin approval states
  isModalOpen = signal<boolean>(false);
  selectedRes = signal<Reservation | null>(null);
  assignedRoomId = '';

  // Columns for admin table
  adminColumns = [
    { key: 'id', label: 'ID' },
    { key: 'customerName', label: 'Guest' },
    { key: 'dates', label: 'Requested Dates' },
    { key: 'roomType', label: 'Room Preferred' },
    { key: 'totalAmount', label: 'Total Due' },
    { key: 'action', label: 'Action' }
  ];

  pendingReservations = computed(() => {
    return this.reservations().filter(r => r.status === 'PENDING');
  });

  matchingRooms = computed(() => {
    const res = this.selectedRes();
    if (!res) return [];
    return this.rooms().filter(rm => rm.status === 'VACANT' && rm.type === res.roomType);
  });

  ngOnInit(): void {
    if (this.isAdmin()) {
      this.loadAdminData();
    } else {
      this.initForm();
      this.isLoading.set(false);
    }
  }

  initForm(): void {
    const nextWeek = new Date();
    nextWeek.setDate(nextWeek.getDate() + 4);
    const defaultCheckIn = this.today;
    const defaultCheckOut = nextWeek.toISOString().split('T')[0];

    this.bookingForm = this.fb.group({
      checkIn: [defaultCheckIn, Validators.required],
      checkOut: [defaultCheckOut, Validators.required],
      roomType: ['Single Room', Validators.required]
    });

    this.calculateTotals();
  }

  isFieldInvalid(field: string): boolean {
    const ctrl = this.bookingForm.get(field);
    return !!ctrl && ctrl.invalid && (ctrl.dirty || ctrl.touched);
  }

  calculateTotals(): void {
    if (!this.bookingForm) return;

    const startStr = this.bookingForm.value.checkIn;
    const endStr = this.bookingForm.value.checkOut;
    const type = this.bookingForm.value.roomType;

    if (!startStr || !endStr) return;

    const start = new Date(startStr);
    const end = new Date(endStr);
    
    // Ensure checkOut is after checkIn
    if (end <= start) {
      this.bookingForm.get('checkOut')?.setErrors({ invalidDate: true });
      this.totalNights.set(0);
      this.estimatedAmount.set(0);
      return;
    } else {
      this.bookingForm.get('checkOut')?.setErrors(null);
    }

    const diff = Math.abs(end.getTime() - start.getTime());
    const nights = Math.ceil(diff / (1000 * 60 * 60 * 24));
    this.totalNights.set(nights);

    const rate = this.roomTypeOptions.find(opt => opt.name === type)?.rate || 0;
    this.estimatedAmount.set(nights * rate);
  }

  onReset(): void {
    this.initForm();
  }

  onBook(): void {
    if (this.bookingForm.invalid) {
      return;
    }

    this.isSubmitting.set(true);
    const currentUser = this.user();
    
    const payload = {
      checkIn: this.bookingForm.value.checkIn,
      checkOut: this.bookingForm.value.checkOut,
      roomType: this.bookingForm.value.roomType,
      customerName: currentUser?.name || 'Guest',
      customerEmail: currentUser?.email || 'guest@example.com',
      customerPhone: `${currentUser?.countryCode} ${currentUser?.mobileNumber}`,
      customerId: currentUser?.id || 'USR-0000',
      totalAmount: this.estimatedAmount()
    };

    this.resService.createReservation(payload).subscribe({
      next: (res) => {
        this.isSubmitting.set(false);
        this.generatedResId.set(res.id);
        this.successState.set(true);
      },
      error: () => {
        this.isSubmitting.set(false);
      }
    });
  }

  // Admin flows
  loadAdminData(): void {
    this.isLoading.set(true);
    this.resService.getReservations().subscribe({
      next: (resList) => {
        this.reservations.set(resList);
        this.roomService.getRooms().subscribe({
          next: (rmList) => {
            this.rooms.set(rmList);
            this.isLoading.set(false);
          },
          error: () => this.isLoading.set(false)
        });
      },
      error: () => this.isLoading.set(false)
    });
  }

  openAssignModal(res: Reservation): void {
    this.selectedRes.set(res);
    this.assignedRoomId = '';
    this.isModalOpen.set(true);
  }

  closeModal(): void {
    this.isModalOpen.set(false);
    this.selectedRes.set(null);
    this.assignedRoomId = '';
  }

  processReservation(status: 'APPROVED' | 'REJECTED'): void {
    const res = this.selectedRes();
    if (!res) return;

    this.isUpdating.set(true);
    const roomNumber = status === 'APPROVED' ? this.assignedRoomId : undefined;

    this.resService.updateReservationStatus(res.id, status, roomNumber).subscribe({
      next: () => {
        this.isUpdating.set(false);
        this.closeModal();
        this.loadAdminData(); // Refresh lists
      },
      error: (err) => {
        this.isUpdating.set(false);
        const msg = typeof err.error === 'string' ? err.error : (err.error?.message || 'An error occurred when updating reservation.');
        alert(msg);
      }
    });
  }
}
