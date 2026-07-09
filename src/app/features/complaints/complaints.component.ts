import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { ComplaintService } from '../../core/services/complaint.service';
import { Complaint } from '../../core/models/complaint.model';
import { UiCardComponent } from '../../shared/ui/ui-card/ui-card.component';
import { UiTableComponent } from '../../shared/ui/ui-table/ui-table.component';
import { UiLoaderComponent } from '../../shared/ui/ui-loader/ui-loader.component';
import { UiErrorComponent } from '../../shared/ui/ui-error/ui-error.component';

@Component({
  selector: 'app-complaints',
  standalone: true,
  imports: [
    CommonModule, 
    ReactiveFormsModule, 
    RouterLink, 
    UiCardComponent, 
    UiTableComponent, 
    UiLoaderComponent, 
    UiErrorComponent
  ],
  template: `
    <div class="space-y-6">
      
      <!-- Welcome Header -->
      <div>
        <h2 class="text-xl md:text-2xl font-black text-slate-900 tracking-tight">
          {{ isAdmin() ? 'Complaints & Requests Queue' : 'Report Room Incident' }}
        </h2>
        <p class="text-xs text-slate-500 mt-1">
          {{ isAdmin() ? 'Review guest incident details and coordinate resolutions.' : 'File formal tickets for repair work or room housekeeping requests.' }}
        </p>
      </div>

      <!-- Customer Incident Form / Admin Tables split -->
      <div class="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        @if (!isAdmin()) {
          <!-- CUSTOMER INCIDENT FILING FORM (4 columns) -->
          <div class="lg:col-span-4">
            <app-ui-card title="Submit Complaint Ticket">
              <form [formGroup]="complaintForm" (ngSubmit)="onSubmitComplaint()" class="space-y-4">
                
                <!-- Complaint Type -->
                <div>
                  <label for="compType" class="block text-xs font-bold text-slate-700 uppercase tracking-wide">Incident Category</label>
                  <select 
                    id="compType" 
                    formControlName="type"
                    class="mt-1 block w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs md:text-sm focus:outline-none focus:border-brand-blue focus:ring-1 focus:ring-brand-blue transition-colors"
                  >
                    <option value="Plumbing">Plumbing (Leaks, Drainage)</option>
                    <option value="Electrical">Electrical (Lights, Power, AC)</option>
                    <option value="Cleaning">Cleaning & Housekeeping</option>
                    <option value="Noise">Noise Disturbance</option>
                    <option value="Other">Other Incident</option>
                  </select>
                </div>

                <!-- Room Number -->
                <div>
                  <label for="roomNo" class="block text-xs font-bold text-slate-700 uppercase tracking-wide">Room Number</label>
                  <input 
                    id="roomNo" 
                    type="text" 
                    formControlName="roomNumber"
                    class="mt-1 block w-full px-3 py-2.5 bg-white border border-slate-200 rounded-lg text-xs md:text-sm placeholder-slate-400 focus:outline-none focus:border-brand-blue focus:ring-1 focus:ring-brand-blue transition-colors font-mono"
                    placeholder="e.g. 104"
                  />
                  <app-ui-error [show]="isFieldInvalid('roomNumber')" message="Room number is required."></app-ui-error>
                </div>

                <!-- Contact phone - prefilled -->
                <div>
                  <label for="contactNo" class="block text-xs font-bold text-slate-700 uppercase tracking-wide">Contact Number</label>
                  <input 
                    id="contactNo" 
                    type="text" 
                    formControlName="contactNumber"
                    class="mt-1 block w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs md:text-sm text-slate-600 focus:outline-none font-mono cursor-not-allowed"
                    readonly
                  />
                </div>

                <!-- Customer ID - prefilled -->
                <div>
                  <label for="customerNo" class="block text-xs font-bold text-slate-700 uppercase tracking-wide">Customer ID</label>
                  <input 
                    id="customerNo" 
                    type="text" 
                    formControlName="customerId"
                    class="mt-1 block w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs md:text-sm text-slate-600 focus:outline-none font-mono cursor-not-allowed"
                    readonly
                  />
                </div>

                <!-- Description -->
                <div>
                  <label for="desc" class="block text-xs font-bold text-slate-700 uppercase tracking-wide">Description</label>
                  <textarea 
                    id="desc" 
                    formControlName="description"
                    rows="3"
                    class="mt-1 block w-full px-3 py-2.5 bg-white border border-slate-200 rounded-lg text-xs md:text-sm placeholder-slate-400 focus:outline-none focus:border-brand-blue focus:ring-1 focus:ring-brand-blue transition-colors"
                    placeholder="Provide details about the issue..."
                  ></textarea>
                  <app-ui-error [show]="isFieldInvalid('description')" message="Provide description details."></app-ui-error>
                </div>

                <!-- Submit -->
                <button 
                  type="submit" 
                  [disabled]="complaintForm.invalid || isSubmitting()"
                  class="w-full py-2.5 px-4 bg-slate-950 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold disabled:opacity-40 disabled:cursor-not-allowed focus:outline-none transition-colors"
                >
                  @if (isSubmitting()) {
                    <div class="inline-block animate-spin rounded-full h-3 w-3 border-2 border-slate-400 border-t-white mr-1.5"></div>
                  }
                  Submit Ticket
                </button>

              </form>
            </app-ui-card>
          </div>
        }

        <!-- COMPLAINT LIST TABLE (8 or 12 columns) -->
        <div [ngClass]="isAdmin() ? 'lg:col-span-12' : 'lg:col-span-8'" class="space-y-4">
          <h3 class="text-xs font-mono uppercase tracking-widest text-slate-400 font-bold">
            {{ isAdmin() ? 'Master Incident Registry' : 'My Active Complaint Tickets' }}
          </h3>

          @if (isLoading()) {
            <app-ui-loader type="skeleton-table"></app-ui-loader>
          } @else {
            <app-ui-table 
              [columns]="tableColumns" 
              [data]="filteredComplaints()" 
              [cellTemplate]="cellTpl"
            ></app-ui-table>

            <ng-template #cellTpl let-row let-col="column" let-val="val">
              @if (col.key === 'id') {
                <span class="font-mono font-bold text-slate-900">{{ val }}</span>
              } @else if (col.key === 'roomNumber') {
                <span class="font-semibold text-slate-900 bg-slate-100 px-2 py-0.5 rounded text-xs font-mono">Room {{ val }}</span>
              } @else if (col.key === 'createdAt') {
                <span class="text-xs text-slate-500 font-mono">{{ val | date:'yyyy-MM-dd HH:mm' }}</span>
              } @else if (col.key === 'status') {
                <span class="inline-block text-[10px] font-bold px-2 py-0.5 rounded-full font-mono border"
                  [ngClass]="{
                    'bg-yellow-50 text-yellow-600 border-yellow-100': val === 'PENDING',
                    'bg-emerald-50 text-emerald-600 border-emerald-100': val === 'RESOLVED'
                  }">
                  {{ val }}
                </span>
              } @else if (col.key === 'action') {
                @if (row.status === 'PENDING' && isAdmin()) {
                  <button 
                    (click)="resolveTicket(row.id)"
                    [disabled]="isResolving() === row.id"
                    class="px-2.5 py-1 bg-brand-blue hover:bg-brand-blue-hover text-white rounded font-semibold text-xxs tracking-wider uppercase disabled:opacity-40 transition-colors"
                  >
                    @if (isResolving() === row.id) {
                      <div class="inline-block animate-spin rounded-full h-2 w-2 border border-slate-300 border-t-white mr-1"></div>
                    }
                    Resolve
                  </button>
                } @else if (row.status === 'RESOLVED') {
                  <span class="text-xxs text-emerald-600 font-bold uppercase tracking-wider font-mono">Completed</span>
                } @else {
                  <span class="text-xxs text-slate-400 italic">Pending Review</span>
                }
              } @else {
                <span class="font-medium text-slate-800">{{ val }}</span>
              }
            </ng-template>
          }
        </div>

      </div>

    </div>
  `
})
export class ComplaintsComponent implements OnInit {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private complaintService = inject(ComplaintService);

  // States
  isLoading = signal<boolean>(true);
  isSubmitting = signal<boolean>(false);
  isResolving = signal<string | null>(null);

  user = this.authService.currentUser;
  isAdmin = computed(() => this.authService.isAdmin());

  // Collections
  complaints = signal<Complaint[]>([]);

  // Form details
  complaintForm!: FormGroup;

  // Columns for dynamic tables
  tableColumns: any[] = [];

  // Filter listings
  filteredComplaints = computed(() => {
    const list = this.complaints();
    const admin = this.isAdmin();
    const currentUserId = this.user()?.id;

    const filtered = list.filter(c => admin || String(c.customerId) === String(currentUserId));
    // Sort descending by date
    return [...filtered].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  });

  ngOnInit(): void {
    this.configureTable();
    this.loadComplaints();
    if (!this.isAdmin()) {
      this.initForm();
    }
  }

  configureTable(): void {
    if (this.isAdmin()) {
      this.tableColumns = [
        { key: 'id', label: 'Ticket ID' },
        { key: 'customerId', label: 'Guest ID' },
        { key: 'roomNumber', label: 'Room' },
        { key: 'type', label: 'Category' },
        { key: 'description', label: 'Issue Details' },
        { key: 'createdAt', label: 'Date Filed' },
        { key: 'status', label: 'Status' },
        { key: 'action', label: 'Action' }
      ];
    } else {
      this.tableColumns = [
        { key: 'id', label: 'Ticket ID' },
        { key: 'roomNumber', label: 'Room' },
        { key: 'type', label: 'Category' },
        { key: 'description', label: 'Description' },
        { key: 'createdAt', label: 'Date Filed' },
        { key: 'status', label: 'Status' },
        { key: 'action', label: 'Progress' }
      ];
    }
  }

  initForm(): void {
    const currentUser = this.user();
    this.complaintForm = this.fb.group({
      type: ['Plumbing', Validators.required],
      roomNumber: ['', Validators.required],
      contactNumber: [`${currentUser?.countryCode} ${currentUser?.mobileNumber}`, Validators.required],
      customerId: [currentUser?.id || 'USR-0000', Validators.required],
      description: ['', [Validators.required, Validators.minLength(5)]]
    });
  }

  isFieldInvalid(field: string): boolean {
    if (this.isAdmin()) return false;
    const ctrl = this.complaintForm.get(field);
    return !!ctrl && ctrl.invalid && (ctrl.dirty || ctrl.touched);
  }

  loadComplaints(): void {
    this.isLoading.set(true);
    this.complaintService.getComplaints().subscribe({
      next: (data) => {
        this.complaints.set(data);
        this.isLoading.set(false);
      },
      error: () => this.isLoading.set(false)
    });
  }

  onSubmitComplaint(): void {
    if (this.complaintForm.invalid) return;

    this.isSubmitting.set(true);
    this.complaintService.submitComplaint(this.complaintForm.value).subscribe({
      next: () => {
        this.isSubmitting.set(false);
        this.initForm(); // reset
        this.loadComplaints(); // reload
      },
      error: () => this.isSubmitting.set(false)
    });
  }

  resolveTicket(id: string): void {
    this.isResolving.set(id);
    this.complaintService.resolveComplaint(id).subscribe({
      next: () => {
        this.isResolving.set(null);
        this.loadComplaints();
      },
      error: () => this.isResolving.set(null)
    });
  }
}
