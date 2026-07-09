import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-ui-error',
  standalone: true,
  template: `
    @if (show && message) {
      <p class="text-xs text-red-500 mt-1 font-medium flex items-center gap-1">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-3.5 w-3.5 shrink-0" viewBox="0 0 20 20" fill="currentColor">
          <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd" />
        </svg>
        <span>{{ message }}</span>
      </p>
    }
  `
})
export class UiErrorComponent {
  @Input() message = '';
  @Input() show = false;
}
