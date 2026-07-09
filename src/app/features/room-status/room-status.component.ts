import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RoomService } from '../../core/services/room.service';
import { Room, RoomStatus } from '../../core/models/room.model';
import { UiCardComponent } from '../../shared/ui/ui-card/ui-card.component';
import { UiLoaderComponent } from '../../shared/ui/ui-loader/ui-loader.component';

@Component({
  selector: 'app-room-status',
  standalone: true,
  imports: [CommonModule, FormsModule, UiCardComponent, UiLoaderComponent],
  template: `
    <div class="space-y-6">
      
      <!-- Welcome Header -->
      <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 class="text-xl md:text-2xl font-black text-slate-900 tracking-tight">Room Availability & Housekeeping</h2>
          <p class="text-xs text-slate-500 mt-1">Monitor room occupancy states, clean statuses, and change room availability inline.</p>
        </div>
      </div>

      <!-- Quick Summary Metrics -->
      <div class="grid grid-cols-3 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-100">
        <div class="text-center py-2 border-r border-slate-200">
          <p class="text-[10px] uppercase font-mono tracking-wider text-slate-400 font-bold">Vacant</p>
          <p class="text-lg font-bold text-brand-blue">{{ vacantCount() }}</p>
        </div>
        <div class="text-center py-2 border-r border-slate-200">
          <p class="text-[10px] uppercase font-mono tracking-wider text-slate-400 font-bold">Occupied</p>
          <p class="text-lg font-bold text-slate-950">{{ occupiedCount() }}</p>
        </div>
        <div class="text-center py-2">
          <p class="text-[10px] uppercase font-mono tracking-wider text-slate-400 font-bold">Maintenance</p>
          <p class="text-lg font-bold text-orange-600">{{ maintenanceCount() }}</p>
        </div>
      </div>

      @if (isLoading()) {
        <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
          <app-ui-loader type="skeleton-card"></app-ui-loader>
          <app-ui-loader type="skeleton-card"></app-ui-loader>
          <app-ui-loader type="skeleton-card"></app-ui-loader>
          <app-ui-loader type="skeleton-card"></app-ui-loader>
        </div>
      } @else {
        <!-- Rooms Grid -->
        <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          @for (rm of rooms(); track rm.id) {
            <div 
              class="bg-white border border-slate-100 rounded-xl p-5 shadow-premium hover:shadow-premium-lg transition-all duration-200 flex flex-col justify-between"
              [ngClass]="{
                'border-l-4 border-l-brand-blue': rm.status === 'VACANT',
                'border-l-4 border-l-slate-950': rm.status === 'OCCUPIED',
                'border-l-4 border-l-orange-500': rm.status === 'MAINTENANCE'
              }"
            >
              <div class="space-y-3">
                <div class="flex justify-between items-start">
                  <div>
                    <h3 class="text-sm font-bold text-slate-900 font-mono">Room {{ rm.id }}</h3>
                    <p class="text-xxs text-slate-400 tracking-wide uppercase font-semibold mt-0.5">{{ rm.type }}</p>
                  </div>
                  
                  <span class="inline-block text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded font-mono"
                    [ngClass]="{
                      'bg-brand-blue/10 text-brand-blue': rm.status === 'VACANT',
                      'bg-slate-950 text-white': rm.status === 'OCCUPIED',
                      'bg-orange-50 text-orange-600': rm.status === 'MAINTENANCE'
                    }">
                    {{ rm.status }}
                  </span>
                </div>

                <div class="text-xs text-slate-500">
                  Rate: <span class="font-bold text-slate-800 font-mono">\${{ rm.price }}</span> / night
                </div>
              </div>

              <!-- Quick Status Modification Trigger (Admin privilege) -->
              <div class="mt-4 pt-3 border-t border-slate-50">
                <label [for]="'status-' + rm.id" class="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Set Status</label>
                <select 
                  [id]="'status-' + rm.id"
                  [ngModel]="rm.status" 
                  (ngModelChange)="changeStatus(rm.id, $event)"
                  [disabled]="isUpdating() === rm.id"
                  class="block w-full px-2 py-1.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded text-xxs font-semibold tracking-wide uppercase focus:outline-none focus:border-brand-blue transition-colors font-mono cursor-pointer"
                >
                  <option value="VACANT">Vacant</option>
                  <option value="OCCUPIED">Occupied</option>
                  <option value="MAINTENANCE">Maintenance</option>
                </select>
              </div>

            </div>
          }
        </div>
      }

    </div>
  `
})
export class RoomStatusComponent implements OnInit {
  private roomService = inject(RoomService);

  // States
  isLoading = signal<boolean>(true);
  isUpdating = signal<string | null>(null);

  // Collections
  rooms = signal<Room[]>([]);

  // Computed summary metrics
  vacantCount = () => this.rooms().filter(r => r.status === 'VACANT').length;
  occupiedCount = () => this.rooms().filter(r => r.status === 'OCCUPIED').length;
  maintenanceCount = () => this.rooms().filter(r => r.status === 'MAINTENANCE').length;

  ngOnInit(): void {
    this.loadRooms();
  }

  loadRooms(): void {
    this.isLoading.set(true);
    this.roomService.getRooms().subscribe({
      next: (data) => {
        this.rooms.set(data);
        this.isLoading.set(false);
      },
      error: () => this.isLoading.set(false)
    });
  }

  changeStatus(roomId: string, newStatus: RoomStatus): void {
    this.isUpdating.set(roomId);
    this.roomService.updateRoomStatus(roomId, newStatus).subscribe({
      next: () => {
        this.isUpdating.set(null);
        this.loadRooms(); // Refresh the grid
      },
      error: () => {
        this.isUpdating.set(null);
      }
    });
  }
}
