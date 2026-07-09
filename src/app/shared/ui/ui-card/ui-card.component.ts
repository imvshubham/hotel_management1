import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-ui-card',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="bg-white rounded-xl border border-slate-100 shadow-premium p-6 transition-all duration-200 hover:border-slate-200">
      @if (title) {
        <div class="mb-4 pb-3 border-b border-slate-100 flex items-center justify-between">
          <h3 class="text-xs font-bold uppercase tracking-wider text-slate-500">{{ title }}</h3>
          <ng-content select="[card-action]"></ng-content>
        </div>
      }
      <ng-content></ng-content>
    </div>
  `
})
export class UiCardComponent {
  @Input() title?: string;
}
