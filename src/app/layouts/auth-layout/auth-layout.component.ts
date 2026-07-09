import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-auth-layout',
  standalone: true,
  imports: [RouterOutlet],
  template: `
    <div class="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div class="sm:mx-auto sm:w-full sm:max-w-md">
        <!-- Logo/Branding -->
        <div class="flex justify-center items-center gap-2 mb-2">
          <div class="w-8 h-8 rounded bg-brand-dark flex items-center justify-center text-white font-black text-sm">H</div>
          <span class="text-lg font-bold tracking-tight text-brand-dark">The Shivalik</span>
        </div>
        <p class="text-center text-xs tracking-widest uppercase font-mono text-slate-400">
          Grand Hotel & Residences
        </p>
      </div>

      <div class="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div class="bg-white py-8 px-4 border border-slate-100 shadow-premium sm:rounded-xl sm:px-10">
          <router-outlet></router-outlet>
        </div>
      </div>
    </div>
  `
})
export class AuthLayoutComponent {}
