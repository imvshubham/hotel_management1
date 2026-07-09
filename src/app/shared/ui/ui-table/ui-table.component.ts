import { Component, Input, ContentChild, TemplateRef } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-ui-table',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="overflow-x-auto w-full border border-slate-100 rounded-xl bg-white shadow-premium">
      <table class="w-full text-left border-collapse text-xs md:text-sm">
        <thead>
          <tr class="border-b border-slate-100 bg-slate-50/70">
            @for (col of columns; track col.key) {
              <th class="py-4 px-6 font-semibold text-slate-500 text-xxs uppercase tracking-widest font-mono">
                {{ col.label }}
              </th>
            }
          </tr>
        </thead>
        <tbody class="divide-y divide-slate-100">
          @if (data.length === 0) {
            <tr>
              <td [attr.colspan]="columns.length" class="py-16 text-center text-slate-400 text-sm">
                <div class="flex flex-col items-center justify-center space-y-2">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0a2 2 0 01-2 2H6a2 2 0 01-2-2m16 0V9a2 2 0 00-2-2H6a2 2 0 00-2 2v4" />
                  </svg>
                  <span>No data available.</span>
                </div>
              </td>
            </tr>
          } @else {
            @for (row of data; track row.id || $index) {
              <tr class="hover:bg-slate-50/30 transition-colors duration-150">
                @for (col of columns; track col.key) {
                  <td class="py-4 px-6 text-slate-700">
                    <ng-container *ngTemplateOutlet="cellTemplate || defaultCellTemplate; context: { $implicit: row, column: col, val: row[col.key] }"></ng-container>
                  </td>
                }
              </tr>
            }
          }
        </tbody>
      </table>
    </div>

    <!-- Default Cell Renderer -->
    <ng-template #defaultCellTemplate let-row let-col="column" let-val="val">
      <span class="font-medium text-slate-900">{{ val }}</span>
    </ng-template>
  `
})
export class UiTableComponent {
  @Input() columns: { key: string; label: string }[] = [];
  @Input() data: any[] = [];
  @Input() cellTemplate?: TemplateRef<any>;
}
