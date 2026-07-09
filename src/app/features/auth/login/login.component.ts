import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { UserRole } from '../../../core/models/user.model';
import { UiErrorComponent } from '../../../shared/ui/ui-error/ui-error.component';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink, UiErrorComponent],
  template: `
    <div>
      <h2 class="text-center text-xl font-black text-slate-950 tracking-tight mb-2">
        Sign In
      </h2>
      <p class="text-center text-xs text-slate-400 mb-6">Access your hotel management portal.</p>

      <!-- Tab selection for Customer vs Admin -->
      <div class="flex border-b border-slate-100 mb-6">
        <button 
          type="button"
          (click)="selectRole('CUSTOMER')"
          [class.border-brand-blue]="selectedRole() === 'CUSTOMER'"
          [class.text-brand-blue]="selectedRole() === 'CUSTOMER'"
          [class.font-semibold]="selectedRole() === 'CUSTOMER'"
          class="flex-1 py-3 text-center border-b-2 border-transparent text-xs uppercase tracking-wider font-semibold text-slate-400 hover:text-slate-700 transition-colors"
        >
          Customer
        </button>
        <button 
          type="button"
          (click)="selectRole('ADMIN')"
          [class.border-brand-blue]="selectedRole() === 'ADMIN'"
          [class.text-brand-blue]="selectedRole() === 'ADMIN'"
          [class.font-semibold]="selectedRole() === 'ADMIN'"
          class="flex-1 py-3 text-center border-b-2 border-transparent text-xs uppercase tracking-wider font-semibold text-slate-400 hover:text-slate-700 transition-colors"
        >
          Staff & Admin
        </button>
      </div>

      @if (errorMsg) {
        <div class="mb-4 bg-red-50 text-red-700 p-3 rounded-lg border border-red-100 text-xs font-semibold flex items-center gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          {{ errorMsg }}
        </div>
      }

      <form [formGroup]="loginForm" (ngSubmit)="onSubmit()" class="space-y-4">
        <!-- Username / Customer ID -->
        <div>
          <label for="username" class="block text-xs font-bold text-slate-700 uppercase tracking-wide">
            {{ selectedRole() === 'CUSTOMER' ? 'Customer ID / Username' : 'Username' }}
          </label>
          <input 
            id="username" 
            type="text" 
            formControlName="username"
            class="mt-1 block w-full px-3 py-2.5 bg-white border border-slate-200 rounded-lg text-xs md:text-sm placeholder-slate-400 focus:outline-none focus:border-brand-blue focus:ring-1 focus:ring-brand-blue transition-colors font-mono"
            placeholder="Enter ID / Username"
          />
          <app-ui-error [show]="isFieldInvalid('username')" message="Username is required (min 5 characters)."></app-ui-error>
        </div>

        <!-- Password -->
        <div>
          <label for="password" class="block text-xs font-bold text-slate-700 uppercase tracking-wide">Password</label>
          <input 
            id="password" 
            type="password" 
            formControlName="password"
            class="mt-1 block w-full px-3 py-2.5 bg-white border border-slate-200 rounded-lg text-xs md:text-sm placeholder-slate-400 focus:outline-none focus:border-brand-blue focus:ring-1 focus:ring-brand-blue transition-colors"
            placeholder="••••••••"
          />
          <app-ui-error [show]="isFieldInvalid('password')" message="Password is required (min 6 characters)."></app-ui-error>
        </div>

        <!-- Submit Button -->
        <button 
          type="submit" 
          [disabled]="loginForm.invalid || isLoading"
          class="w-full py-2.5 px-4 border border-transparent rounded-xl shadow-sm text-xs font-semibold text-white bg-slate-950 hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none transition-colors"
        >
          @if (isLoading) {
            <div class="inline-block animate-spin rounded-full h-3 w-3 border-2 border-slate-400 border-t-white mr-1.5"></div>
          }
          Sign In as {{ selectedRole() === 'CUSTOMER' ? 'Customer' : 'Staff' }}
        </button>

        <div class="text-center pt-4 border-t border-slate-100">
          <span class="text-xs text-slate-500">Don't have an account? </span>
          <a routerLink="/auth/register" class="text-xs font-bold text-brand-blue hover:underline">Register</a>
        </div>
      </form>
    </div>
  `
})
export class LoginComponent {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);

  loginForm: FormGroup;
  isLoading = false;
  errorMsg: string | null = null;
  
  selectedRole = signal<UserRole>('CUSTOMER');

  constructor() {
    this.loginForm = this.fb.group({
      username: ['', [Validators.required, Validators.minLength(5)]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  selectRole(role: UserRole): void {
    this.selectedRole.set(role);
    this.loginForm.reset({
      username: '',
      password: ''
    });
    this.errorMsg = null;
  }

  isFieldInvalid(field: string): boolean {
    const ctrl = this.loginForm.get(field);
    return !!ctrl && ctrl.invalid && (ctrl.dirty || ctrl.touched);
  }

  onSubmit(): void {
    if (this.loginForm.invalid) {
      return;
    }

    this.isLoading = true;
    this.errorMsg = null;

    const payload = {
      username: this.loginForm.value.username.trim(),
      password: this.loginForm.value.password,
      role: this.selectedRole()
    };

    this.authService.login(payload).subscribe({
      next: () => {
        this.isLoading = false;
        this.router.navigate(['/dashboard']);
      },
      error: (err) => {
        this.isLoading = false;
        if (err.status === 401 || err.status === 400 || err.status === 403) {
          this.errorMsg = typeof err.error === 'string' ? err.error : (err.error?.message || 'Invalid username, password, or role selection.');
        } else if (err.status === 0) {
          this.errorMsg = 'Could not connect to the server. Please ensure the backend microservices are running.';
        } else {
          this.errorMsg = err.error?.message || err.message || 'An unexpected error occurred.';
        }
      }
    });
  }
}
