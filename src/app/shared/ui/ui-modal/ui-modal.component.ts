import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-ui-modal',
  standalone: true,
  imports: [CommonModule],
  template: `
    @if (isOpen) {
      <div class="fixed inset-0 z-50 flex items-center justify-center p-4">
        <!-- Backdrop -->
        <div class="absolute inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity" (click)="closeModal()"></div>
        
        <!-- Modal Panel -->
        <div class="relative bg-white rounded-xl shadow-premium-lg border border-slate-100 max-w-lg w-full overflow-hidden transform transition-all duration-300 scale-100 opacity-100 z-10">
          <!-- Header -->
          <div class="flex items-center justify-between px-6 py-4 border-b border-slate-100">
            <h3 class="text-sm font-bold uppercase tracking-wider text-slate-900">{{ title }}</h3>
            <button (click)="closeModal()" class="text-slate-400 hover:text-slate-600 transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd" />
              </svg>
            </button>
          </div>

          <!-- Body -->
          <div class="p-6 overflow-y-auto max-h-[75vh]">
            <ng-content></ng-content>
          </div>

          <!-- Footer -->
          @if (showFooter) {
            <div class="flex justify-end gap-3 px-6 py-4 bg-slate-50/50 border-t border-slate-100">
              <ng-content select="[modal-footer]"></ng-content>
            </div>
          }
        </div>
      </div>
    }
  `
})
export class UiModalComponent {
  @Input() isOpen = false;
  @Input() title = 'Modal';
  @Input() showFooter = true;
  
  @Output() onClose = new EventEmitter<void>();

  closeModal(): void {
    this.isOpen = false;
    this.onClose.emit();
  }
}
