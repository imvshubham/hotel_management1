import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { UiErrorComponent } from '../../../shared/ui/ui-error/ui-error.component';
import { UiLoaderComponent } from '../../../shared/ui/ui-loader/ui-loader.component';

// Custom validator to verify passwords match
function passwordsMatchValidator(group: FormGroup): { [key: string]: boolean } | null {
  const password = group.get('password')?.value;
  const confirmPassword = group.get('confirmPassword')?.value;
  return password === confirmPassword ? null : { mismatch: true };
}

// Custom validator for trimmed input with no spaces
function noSpacesValidator(control: any): { [key: string]: boolean } | null {
  const val = control.value || '';
  if (val.trim() !== val) {
    return { needsTrim: true };
  }
  if (val.indexOf(' ') >= 0) {
    return { hasSpaces: true };
  }
  return null;
}

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink, UiErrorComponent, UiLoaderComponent],
  template: `
    <div>
      @if (successState()) {
        <!-- Success State Acknowledgment -->
        <div class="text-center py-6 space-y-6">
          <div class="inline-flex items-center justify-center w-12 h-12 rounded-full bg-brand-blue/10 text-brand-blue">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          
          <div class="space-y-2">
            <h2 class="text-xl font-bold text-slate-900">Registration Complete</h2>
            <p class="text-sm text-slate-500">Your customer account has been generated successfully.</p>
          </div>

          <div class="bg-slate-50 border border-slate-100 rounded-lg p-5 inline-block w-full">
            <p class="text-xs text-slate-400 font-mono uppercase tracking-wider mb-1">Your Customer ID / Username</p>
            <p class="text-xl font-mono font-bold text-brand-blue tracking-wider">{{ generatedUserId() }}</p>
          </div>

          <p class="text-xs text-slate-400">Please save this username. You can now use it to sign in.</p>

          <div class="pt-4">
            <a 
              routerLink="/auth/login" 
              class="w-full inline-flex justify-center py-2.5 px-4 border border-transparent rounded-lg shadow-sm text-xs font-semibold text-white bg-slate-950 hover:bg-slate-800 focus:outline-none transition-colors"
            >
              Proceed to Login
            </a>
          </div>
        </div>
      } @else {
        <!-- Form State -->
        <h2 class="text-center text-xl font-black text-slate-950 tracking-tight mb-2">
          Create an Account
        </h2>
        <p class="text-center text-xs text-slate-400 mb-8">Register as a guest to book your luxury stay.</p>

        @if (errorMsg) {
          <div class="mb-4 bg-red-50 text-red-700 p-3 rounded-lg border border-red-100 text-xs font-semibold flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            {{ errorMsg }}
          </div>
        }

        <form [formGroup]="registerForm" (ngSubmit)="onSubmit()" class="space-y-4">
          <!-- Name -->
          <div>
            <label for="name" class="block text-xs font-bold text-slate-700 uppercase tracking-wide">Full Name</label>
            <input 
              id="name" 
              type="text" 
              formControlName="name"
              class="mt-1 block w-full px-3 py-2.5 bg-white border border-slate-200 rounded-lg text-xs md:text-sm placeholder-slate-400 focus:outline-none focus:border-brand-blue focus:ring-1 focus:ring-brand-blue transition-colors"
              placeholder="e.g. Aarav Sharma"
            />
            <app-ui-error [show]="isFieldInvalid('name')" message="Name is required."></app-ui-error>
          </div>

          <!-- Email -->
          <div>
            <label for="email" class="block text-xs font-bold text-slate-700 uppercase tracking-wide">Email Address</label>
            <input 
              id="email" 
              type="email" 
              formControlName="email"
              class="mt-1 block w-full px-3 py-2.5 bg-white border border-slate-200 rounded-lg text-xs md:text-sm placeholder-slate-400 focus:outline-none focus:border-brand-blue focus:ring-1 focus:ring-brand-blue transition-colors"
              placeholder="e.g. aarav.sharma&#64;example.com"
            />
            <app-ui-error [show]="isFieldInvalid('email')" message="Provide a valid email address."></app-ui-error>
          </div>

          <!-- Phone (Default India +91) -->
          <div class="grid grid-cols-3 gap-2">
            <div class="col-span-1">
              <label for="countryCode" class="block text-xs font-bold text-slate-700 uppercase tracking-wide">Code</label>
              <select 
                id="countryCode" 
                formControlName="countryCode"
                class="mt-1 block w-full px-3 py-2.5 bg-white border border-slate-200 rounded-lg text-xs md:text-sm focus:outline-none focus:border-brand-blue focus:ring-1 focus:ring-brand-blue transition-colors font-semibold"
              >
                <option value="+91" selected>+91 (IN)</option>
                <option value="+1">+1 (US)</option>
                <option value="+44">+44 (UK)</option>
                <option value="+61">+61 (AU)</option>
              </select>
            </div>
            <div class="col-span-2">
              <label for="mobileNumber" class="block text-xs font-bold text-slate-700 uppercase tracking-wide">Mobile Number</label>
              <input 
                id="mobileNumber" 
                type="text" 
                formControlName="mobileNumber"
                class="mt-1 block w-full px-3 py-2.5 bg-white border border-slate-200 rounded-lg text-xs md:text-sm placeholder-slate-400 focus:outline-none focus:border-brand-blue focus:ring-1 focus:ring-brand-blue transition-colors"
                placeholder="e.g. 9876543210"
              />
              <app-ui-error [show]="isFieldInvalid('mobileNumber')" message="Required. Provide a valid 10-digit mobile number."></app-ui-error>
            </div>
          </div>

          <!-- Address -->
          <div>
            <label for="address" class="block text-xs font-bold text-slate-700 uppercase tracking-wide">Address</label>
            <input 
              id="address" 
              type="text" 
              formControlName="address"
              class="mt-1 block w-full px-3 py-2.5 bg-white border border-slate-200 rounded-lg text-xs md:text-sm placeholder-slate-400 focus:outline-none focus:border-brand-blue focus:ring-1 focus:ring-brand-blue transition-colors"
              placeholder="e.g. Garima Park, Gandhinagar, Gujarat"
            />
            <app-ui-error [show]="isFieldInvalid('address')" message="Address is required."></app-ui-error>
          </div>

          <!-- Customer ID / Username (trimmed, no spaces, 5-20 characters) -->
          <div>
            <label for="username" class="block text-xs font-bold text-slate-700 uppercase tracking-wide">Customer ID / Username</label>
            <input 
              id="username" 
              type="text" 
              formControlName="username"
              class="mt-1 block w-full px-3 py-2.5 bg-white border border-slate-200 rounded-lg text-xs md:text-sm placeholder-slate-400 focus:outline-none focus:border-brand-blue focus:ring-1 focus:ring-brand-blue transition-colors font-mono"
              placeholder="Choose a unique Customer ID"
            />
            
            @if (isFieldInvalid('username')) {
              <div class="mt-1">
                @if (registerForm.get('username')?.hasError('required')) {
                  <app-ui-error [show]="true" message="Customer ID is required."></app-ui-error>
                }
                @if (registerForm.get('username')?.hasError('minlength')) {
                  <app-ui-error [show]="true" message="Minimum 5 characters required."></app-ui-error>
                }
                @if (registerForm.get('username')?.hasError('maxlength')) {
                  <app-ui-error [show]="true" message="Maximum 20 characters limit."></app-ui-error>
                }
                @if (registerForm.get('username')?.hasError('needsTrim') || registerForm.get('username')?.hasError('hasSpaces')) {
                  <app-ui-error [show]="true" message="No spaces or untrimmed characters allowed."></app-ui-error>
                }
              </div>
            }
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

            <!-- Real-time Validation Checkmarks -->
            @if (passwordValue()) {
              <div class="mt-2 space-y-1 bg-slate-50 border border-slate-100 p-3 rounded-lg text-xxs font-mono">
                <p class="font-bold text-slate-500 uppercase tracking-wider mb-1.5">Password Requirements:</p>
                <div class="grid grid-cols-1 sm:grid-cols-2 gap-x-2 gap-y-1">
                  <!-- Rule 1: Length -->
                  <div class="flex items-center gap-1.5" [ngClass]="hasMinLength() ? 'text-emerald-600' : 'text-red-500'">
                    <span>{{ hasMinLength() ? '✓' : '✗' }}</span>
                    <span>8-30 Characters</span>
                  </div>
                  <!-- Rule 2: Uppercase -->
                  <div class="flex items-center gap-1.5" [ngClass]="hasUppercase() ? 'text-emerald-600' : 'text-red-500'">
                    <span>{{ hasUppercase() ? '✓' : '✗' }}</span>
                    <span>1 Uppercase (A-Z)</span>
                  </div>
                  <!-- Rule 3: Lowercase -->
                  <div class="flex items-center gap-1.5" [ngClass]="hasLowercase() ? 'text-emerald-600' : 'text-red-500'">
                    <span>{{ hasLowercase() ? '✓' : '✗' }}</span>
                    <span>1 Lowercase (a-z)</span>
                  </div>
                  <!-- Rule 4: Number -->
                  <div class="flex items-center gap-1.5" [ngClass]="hasNumber() ? 'text-emerald-600' : 'text-red-500'">
                    <span>{{ hasNumber() ? '✓' : '✗' }}</span>
                    <span>1 Number (0-9)</span>
                  </div>
                  <!-- Rule 5: Special -->
                  <div class="flex items-center gap-1.5" [ngClass]="hasSpecial() ? 'text-emerald-600' : 'text-red-500'">
                    <span>{{ hasSpecial() ? '✓' : '✗' }}</span>
                    <span>1 Special symbol (&#64;$!%*?&)</span>
                  </div>
                </div>
              </div>
            }
          </div>

          <!-- Confirm Password -->
          <div>
            <label for="confirmPassword" class="block text-xs font-bold text-slate-700 uppercase tracking-wide">Confirm Password</label>
            <input 
              id="confirmPassword" 
              type="password" 
              formControlName="confirmPassword"
              class="mt-1 block w-full px-3 py-2.5 bg-white border border-slate-200 rounded-lg text-xs md:text-sm placeholder-slate-400 focus:outline-none focus:border-brand-blue focus:ring-1 focus:ring-brand-blue transition-colors"
              placeholder="••••••••"
            />
            
            <!-- Real-time Matching indicator UI -->
            @if (showConfirmFeedback()) {
              <div class="mt-1.5">
                @if (passwordsMatch()) {
                  <span class="inline-flex items-center gap-1 text-xs font-semibold text-emerald-600">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Passwords match
                  </span>
                } @else {
                  <span class="inline-flex items-center gap-1 text-xs font-semibold text-red-500">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Passwords do not match
                  </span>
                }
              </div>
            }
          </div>

          <!-- Actions -->
          <div class="flex items-center gap-3 pt-2">
            <!-- Reset Button -->
            <button 
              type="button" 
              (click)="onReset()" 
              class="flex-1 py-2.5 px-4 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 focus:outline-none transition-colors"
            >
              Reset
            </button>
            
            <!-- Register Button (Disabled until match and valid) -->
            <button 
              type="submit" 
              [disabled]="registerForm.invalid || isLoading || !passwordsMatch()"
              class="flex-1 py-2.5 px-4 border border-transparent rounded-xl shadow-sm text-xs font-semibold text-white bg-slate-950 hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed focus:outline-none transition-colors"
            >
              @if (isLoading) {
                <div class="inline-block animate-spin rounded-full h-3 w-3 border-2 border-slate-400 border-t-white mr-1.5"></div>
              }
              Register Account
            </button>
          </div>

          <div class="text-center pt-4 border-t border-slate-100">
            <span class="text-xs text-slate-500">Already registered? </span>
            <a routerLink="/auth/login" class="text-xs font-bold text-brand-blue hover:underline">Sign In</a>
          </div>
        </form>
      }
    </div>
  `
})
export class RegisterComponent implements OnInit {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  
  registerForm!: FormGroup;
  isLoading = false;
  errorMsg: string | null = null;
  successState = signal<boolean>(false);
  generatedUserId = signal<string>('');

  // Password signals for real-time validation checks
  passwordValue = signal<string>('');
  confirmPasswordValue = signal<string>('');

  hasMinLength = computed(() => {
    const pwd = this.passwordValue();
    return pwd.length >= 8 && pwd.length <= 30;
  });
  hasUppercase = computed(() => /[A-Z]/.test(this.passwordValue()));
  hasLowercase = computed(() => /[a-z]/.test(this.passwordValue()));
  hasNumber = computed(() => /\d/.test(this.passwordValue()));
  hasSpecial = computed(() => /[@$!%*?&]/.test(this.passwordValue()));

  passwordsMatch = computed(() => {
    const p = this.passwordValue();
    const cp = this.confirmPasswordValue();
    return p !== '' && p === cp;
  });
  
  showConfirmFeedback = computed(() => {
    return this.confirmPasswordValue().length > 0;
  });

  ngOnInit(): void {
    this.initForm();
  }

  initForm(): void {
    // strict password pattern checking min 8, max 30, 1 uppercase, 1 lowercase, 1 number, 1 special character
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,30}$/;

    this.registerForm = this.fb.group({
      name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      countryCode: ['+91', Validators.required],
      mobileNumber: ['', [Validators.required, Validators.pattern(/^[6-9]\d{9}$/)]], // Indian 10 digit mobile pattern
      address: ['', Validators.required],
      username: ['', [Validators.required, Validators.minLength(5), Validators.maxLength(20), noSpacesValidator]],
      password: ['', [Validators.required, Validators.pattern(passwordRegex)]],
      confirmPassword: ['', Validators.required]
    }, { validators: passwordsMatchValidator });

    // Wire up value change listeners to trigger real-time signal checks
    this.registerForm.get('password')?.valueChanges.subscribe(val => {
      this.passwordValue.set(val || '');
    });

    this.registerForm.get('confirmPassword')?.valueChanges.subscribe(val => {
      this.confirmPasswordValue.set(val || '');
    });
  }

  isFieldInvalid(field: string): boolean {
    const ctrl = this.registerForm.get(field);
    return !!ctrl && ctrl.invalid && (ctrl.dirty || ctrl.touched);
  }

  onReset(): void {
    this.registerForm.reset({
      countryCode: '+91'
    });
    this.passwordValue.set('');
    this.confirmPasswordValue.set('');
    this.errorMsg = null;
  }

  onSubmit(): void {
    if (this.registerForm.invalid || !this.passwordsMatch()) {
      return;
    }

    this.isLoading = true;
    this.errorMsg = null;

    const formValues = this.registerForm.value;
    const payload = {
      name: formValues.name,
      email: formValues.email,
      countryCode: formValues.countryCode,
      mobileNumber: formValues.mobileNumber,
      address: formValues.address,
      username: formValues.username.trim(), // trim ID
      password: formValues.password,
      role: 'CUSTOMER' as const
    };

    this.authService.register(payload).subscribe({
      next: (res) => {
        this.isLoading = false;
        this.generatedUserId.set(res.userId);
        this.successState.set(true);
      },
      error: (err) => {
        this.isLoading = false;
        if (err.status === 400 || err.status === 409) {
          this.errorMsg = typeof err.error === 'string' ? err.error : (err.error?.message || 'Registration failed. Username or email may already be in use.');
        } else if (err.status === 0) {
          this.errorMsg = 'Could not connect to the server. Please ensure the backend microservices are running.';
        } else {
          this.errorMsg = err.error?.message || err.message || 'An error occurred during registration. Please try again.';
        }
      }
    });
  }
}
