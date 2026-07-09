import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-ui-loader',
  standalone: true,
  imports: [CommonModule],
  template: `
    @if (type === 'spinner') {
      <div class="flex items-center justify-center py-8">
        <div class="animate-spin rounded-full h-8 w-8 border-2 border-slate-200 border-t-brand-blue"></div>
      </div>
    } @else if (type === 'skeleton-card') {
      <div class="animate-pulse bg-white border border-slate-100 rounded-xl p-6 space-y-4 shadow-premium">
        <div class="h-4 bg-slate-100 rounded w-1/4"></div>
        <div class="space-y-2">
          <div class="h-8 bg-slate-100 rounded w-1/2"></div>
          <div class="h-3 bg-slate-100 rounded w-5/6"></div>
          <div class="h-3 bg-slate-100 rounded w-2/3"></div>
        </div>
      </div>
    } @else if (type === 'skeleton-table') {
      <div class="animate-pulse space-y-4 w-full">
        <div class="h-10 bg-slate-100 rounded-lg w-full"></div>
        <div class="h-8 bg-slate-50 rounded-lg w-full"></div>
        <div class="h-8 bg-slate-50 rounded-lg w-full"></div>
        <div class="h-8 bg-slate-50 rounded-lg w-full"></div>
        <div class="h-8 bg-slate-50 rounded-lg w-full"></div>
      </div>
    }
  `
})
export class UiLoaderComponent {
  @Input() type: 'spinner' | 'skeleton-card' | 'skeleton-table' = 'spinner';
}
