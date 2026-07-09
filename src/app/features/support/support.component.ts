import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { UiCardComponent } from '../../shared/ui/ui-card/ui-card.component';
import { UiErrorComponent } from '../../shared/ui/ui-error/ui-error.component';

@Component({
  selector: 'app-support',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink, UiCardComponent, UiErrorComponent],
  template: `
    <div class="space-y-6">
      
      <!-- Welcome Header -->
      <div>
        <h2 class="text-xl md:text-2xl font-black text-slate-900 tracking-tight">Support & Help Desk</h2>
        <p class="text-xs text-slate-500 mt-1">Get in touch with the front desk, submit suggestions, or report room issues.</p>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-12 gap-6">
        
        <!-- Column A: Support Contact Details (5 cols) -->
        <div class="md:col-span-5 space-y-6">
          <app-ui-card title="Direct Contacts">
            <div class="space-y-5 text-xs md:text-sm">
              <div class="flex items-start gap-3">
                <div class="p-2 rounded-lg bg-brand-blue/10 text-brand-blue shrink-0">
                  <!-- Phone Icon -->
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.94.725l.548 2.2a1 1 0 01-.321.988l-1.305.98a10.582 10.582 0 004.872 4.872l.98-1.305a1 1 0 01.988-.321l2.2.548a1 1 0 01.725.94V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                </div>
                <div>
                  <p class="font-bold text-slate-800">Front Desk Hotline</p>
                  <p class="font-mono text-slate-600 mt-0.5">+91 98765 43210</p>
                  <span class="text-xxs text-slate-400">Available 24/7 (Ext. 0 from in-room phone)</span>
                </div>
              </div>

              <div class="flex items-start gap-3">
                <div class="p-2 rounded-lg bg-slate-100 text-slate-800 shrink-0">
                  <!-- Mail Icon -->
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <div>
                  <p class="font-bold text-slate-800">Customer Support</p>
                  <p class="font-mono text-slate-600 mt-0.5">concierge&#64;The Shivalik.in</p>
                  <span class="text-xxs text-slate-400">Expected response within 2 hours</span>
                </div>
              </div>
            </div>
          </app-ui-card>

          <!-- Formal complaints redirection card -->
          <app-ui-card title="Maintenance & Complaints">
            <div class="space-y-4">
              <p class="text-xs text-slate-500">
                To report specific maintenance defaults (leaking fixtures, electrical failures, cleaning queries), please submit a formal complaint ticket for tracking.
              </p>
              <a 
                routerLink="/complaints" 
                class="w-full inline-flex justify-center py-2.5 px-4 bg-slate-950 text-white hover:bg-slate-800 rounded-lg text-xs font-semibold focus:outline-none transition-colors"
              >
                {{ isAdmin() ? 'Review Complaints Queue' : 'File a Room Complaint' }}
              </a>
            </div>
          </app-ui-card>
        </div>

        <!-- Column B: General Feedback Form (7 cols) -->
        <div class="md:col-span-7">
          <app-ui-card title="Share Your Feedback">
            @if (feedbackSubmitted()) {
              <div class="text-center py-8 space-y-4">
                <div class="inline-flex items-center justify-center w-10 h-10 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-100">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <div>
                  <h4 class="font-bold text-slate-900">Thank you for your feedback!</h4>
                  <p class="text-xs text-slate-500 mt-1">We appreciate your support to help us improve The Shivalik.</p>
                </div>
                <button 
                  (click)="resetFeedback()"
                  class="px-4 py-2 border border-slate-200 hover:bg-slate-50 rounded-lg text-xs font-semibold transition-colors"
                >
                  Send another message
                </button>
              </div>
            } @else {
              <form [formGroup]="feedbackForm" (ngSubmit)="onSubmitFeedback()" class="space-y-4">
                <p class="text-xs text-slate-400">
                  Please let us know how your experience has been or highlight aspects where we can improve.
                </p>

                <!-- Feedback Type -->
                <div>
                  <label for="feedbackType" class="block text-xs font-bold text-slate-700 uppercase tracking-wide">Category</label>
                  <select 
                    id="feedbackType" 
                    formControlName="type"
                    class="mt-1 block w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs md:text-sm focus:outline-none focus:border-brand-blue focus:ring-1 focus:ring-brand-blue transition-colors"
                  >
                    <option value="Compliment">Compliment</option>
                    <option value="Suggestion">Suggestion</option>
                    <option value="Inquiry">General Inquiry</option>
                  </select>
                </div>

                <!-- Message/Comments -->
                <div>
                  <label for="feedbackMessage" class="block text-xs font-bold text-slate-700 uppercase tracking-wide">Comments</label>
                  <textarea 
                    id="feedbackMessage" 
                    formControlName="message"
                    rows="4"
                    class="mt-1 block w-full px-3 py-2.5 bg-white border border-slate-200 rounded-lg text-xs md:text-sm placeholder-slate-400 focus:outline-none focus:border-brand-blue focus:ring-1 focus:ring-brand-blue transition-colors"
                    placeholder="Describe your suggestion or compliment details..."
                  ></textarea>
                  <app-ui-error [show]="isFieldInvalid('message')" message="Message content must be at least 10 characters long."></app-ui-error>
                </div>

                <!-- Action Submit -->
                <button 
                  type="submit" 
                  [disabled]="feedbackForm.invalid"
                  class="w-full py-2.5 px-4 bg-brand-blue hover:bg-brand-blue-hover text-white rounded-lg text-xs font-semibold disabled:opacity-40 disabled:cursor-not-allowed focus:outline-none transition-colors"
                >
                  Submit Suggestions
                </button>
              </form>
            }
          </app-ui-card>
        </div>

      </div>

    </div>
  `
})
export class SupportComponent implements OnInit {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);

  // States
  user = this.authService.currentUser;
  isAdmin = computed(() => this.authService.isAdmin());
  
  feedbackForm!: FormGroup;
  feedbackSubmitted = signal<boolean>(false);

  ngOnInit(): void {
    this.initForm();
  }

  initForm(): void {
    this.feedbackForm = this.fb.group({
      type: ['Suggestion', Validators.required],
      message: ['', [Validators.required, Validators.minLength(10)]]
    });
  }

  isFieldInvalid(field: string): boolean {
    const ctrl = this.feedbackForm.get(field);
    return !!ctrl && ctrl.invalid && (ctrl.dirty || ctrl.touched);
  }

  onSubmitFeedback(): void {
    if (this.feedbackForm.invalid) return;
    
    // Simulate submission delay
    setTimeout(() => {
      this.feedbackSubmitted.set(true);
    }, 600);
  }

  resetFeedback(): void {
    this.feedbackSubmitted.set(false);
    this.initForm();
  }
}
