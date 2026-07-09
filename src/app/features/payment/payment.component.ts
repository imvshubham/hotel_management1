import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { BillingService } from '../../core/services/billing.service';
import { Billing } from '../../core/models/billing.model';
import { UiCardComponent } from '../../shared/ui/ui-card/ui-card.component';
import { UiLoaderComponent } from '../../shared/ui/ui-loader/ui-loader.component';
import { UiErrorComponent } from '../../shared/ui/ui-error/ui-error.component';

@Component({
  selector: 'app-payment',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink, UiCardComponent, UiLoaderComponent, UiErrorComponent],
  template: `
    <div class="max-w-4xl mx-auto space-y-6">
      
      <!-- Welcome Header -->
      <div>
        <h2 class="text-xl md:text-2xl font-black text-slate-900 tracking-tight">Secure Payment Checkout</h2>
        <p class="text-xs text-slate-500 mt-1">Complete your hotel reservation billing payment securely.</p>
      </div>

      @if (successState()) {
        <!-- SUCCESS ACKNOWLEDGMENT VIEW -->
        <div class="max-w-md mx-auto text-center bg-white border border-slate-100 rounded-xl p-8 shadow-premium space-y-6">
          <div class="inline-flex items-center justify-center w-12 h-12 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-100">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
          </div>
          
          <div class="space-y-2">
            <h3 class="text-lg font-bold text-slate-900">Transaction Successful</h3>
            <p class="text-xs text-slate-400">Payment receipt has been generated successfully.</p>
          </div>

          <div class="bg-slate-50 border border-slate-100 rounded-xl p-4 space-y-2 text-xs">
            <div class="flex justify-between">
              <span class="text-slate-400">Transaction Reference</span>
              <span class="font-mono font-bold text-slate-700">TXN-{{ transactionId() }}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-slate-400">Amount Charged</span>
              <span class="font-mono font-bold text-slate-950">&#36;{{ amountCharged() }}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-slate-400">Card Masked</span>
              <span class="font-mono font-bold text-slate-700">{{ maskedCardNumber() }}</span>
            </div>
          </div>

          <div class="flex gap-3 justify-center pt-2">
            <a 
              routerLink="/billing" 
              class="flex-1 py-2.5 px-4 border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 focus:outline-none transition-colors text-center"
            >
              Back to Invoices
            </a>
            <a 
              routerLink="/dashboard" 
              class="flex-1 py-2.5 px-4 border border-transparent rounded-lg shadow-sm text-xs font-semibold text-white bg-slate-950 hover:bg-slate-800 focus:outline-none transition-colors text-center"
            >
              Dashboard Home
            </a>
          </div>
        </div>
      } @else {
        <!-- CHECKOUT SPLIT GRID -->
        <div class="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
          
          <!-- Column A: Invoice preview -->
          <div class="md:col-span-5 space-y-6">
            <app-ui-card title="Invoice Summary">
              @if (isLoadingInvoice()) {
                <app-ui-loader></app-ui-loader>
              } @else if (!invoiceData()) {
                <div class="text-center py-6 text-slate-400 text-xs">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8 mx-auto text-slate-300 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                  <span>No outstanding invoice linked to this payment. Please review URL or go to Billing page.</span>
                </div>
              } @else {
                <div class="space-y-4">
                  <div class="flex justify-between border-b border-slate-100 pb-3">
                    <div>
                      <p class="text-xxs font-mono uppercase text-slate-400 font-bold">Invoice ID</p>
                      <p class="font-mono font-bold text-slate-800 text-xs mt-0.5">{{ invoiceData()?.id }}</p>
                    </div>
                    <div class="text-right">
                      <p class="text-xxs font-mono uppercase text-slate-400 font-bold">Reservation ID</p>
                      <p class="font-mono font-bold text-slate-800 text-xs mt-0.5">{{ invoiceData()?.reservationId }}</p>
                    </div>
                  </div>

                  <!-- Breakdowns -->
                  <div class="space-y-2 text-xs">
                    <div class="flex justify-between">
                      <span class="text-slate-400">Room Charges</span>
                      <span class="font-mono font-medium text-slate-700">&#36;{{ invoiceData()?.roomCharges }}</span>
                    </div>
                    <div class="flex justify-between">
                      <span class="text-slate-400">Service Fees</span>
                      <span class="font-mono font-medium text-slate-700">&#36;{{ invoiceData()?.extraServices }}</span>
                    </div>
                    <div class="flex justify-between">
                      <span class="text-slate-400">Tax & Fees (8%)</span>
                      <span class="font-mono font-medium text-slate-700">&#36;{{ invoiceData()?.tax }}</span>
                    </div>
                    <div class="border-t border-slate-100 pt-3 flex justify-between font-bold text-sm bg-slate-50/50 p-3 rounded-lg">
                      <span class="text-slate-800">Total Charged</span>
                      <span class="font-mono text-brand-blue">&#36;{{ invoiceData()?.totalAmount }}</span>
                    </div>
                  </div>
                </div>
              }
            </app-ui-card>
          </div>

          <!-- Column B: Card details form -->
          <div class="md:col-span-7">
            <app-ui-card title="Payment Details">
              <form [formGroup]="cardForm" (ngSubmit)="onSubmitPayment()" class="space-y-5">
                
                @if (errorMsg()) {
                  <div class="bg-red-50 text-red-700 p-3 rounded-lg border border-red-100 text-xs font-semibold flex items-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                    {{ errorMsg() }}
                  </div>
                }
                
                <!-- Card Holder Name -->
                <div>
                  <label for="cardName" class="block text-xs font-bold text-slate-700 uppercase tracking-wide">Cardholder Name</label>
                  <input 
                    id="cardName" 
                    type="text" 
                    formControlName="cardName"
                    class="mt-1 block w-full px-3 py-2.5 bg-white border border-slate-200 rounded-lg text-xs md:text-sm placeholder-slate-400 focus:outline-none focus:border-brand-blue focus:ring-1 focus:ring-brand-blue transition-colors uppercase"
                    placeholder="e.g. JOHN DOE"
                  />
                  <app-ui-error [show]="isFieldInvalid('cardName')" message="Cardholder name is required."></app-ui-error>
                </div>

                <!-- Card Number with spaces mask -->
                <div>
                  <label for="cardNumber" class="block text-xs font-bold text-slate-700 uppercase tracking-wide">Card Number</label>
                  <input 
                    id="cardNumber" 
                    type="text" 
                    formControlName="cardNumber"
                    (input)="maskCardNumber($event)"
                    maxlength="19"
                    class="mt-1 block w-full px-3 py-2.5 bg-white border border-slate-200 rounded-lg text-xs md:text-sm placeholder-slate-400 focus:outline-none focus:border-brand-blue focus:ring-1 focus:ring-brand-blue transition-colors font-mono"
                    placeholder="4111 2222 3333 4444"
                  />
                  <app-ui-error [show]="isFieldInvalid('cardNumber')" message="Provide a valid 16-digit card number."></app-ui-error>
                </div>

                <!-- Expiry & CVV Grid -->
                <div class="grid grid-cols-2 gap-4">
                  <div>
                    <label for="expiry" class="block text-xs font-bold text-slate-700 uppercase tracking-wide">Expiration Date</label>
                    <input 
                      id="expiry" 
                      type="text" 
                      formControlName="expiry"
                      (input)="maskExpiry($event)"
                      maxlength="5"
                      class="mt-1 block w-full px-3 py-2.5 bg-white border border-slate-200 rounded-lg text-xs md:text-sm placeholder-slate-400 focus:outline-none focus:border-brand-blue focus:ring-1 focus:ring-brand-blue transition-colors font-mono"
                      placeholder="MM/YY"
                    />
                    <app-ui-error [show]="isFieldInvalid('expiry')" message="Use MM/YY format."></app-ui-error>
                  </div>
                  <div>
                    <label for="cvv" class="block text-xs font-bold text-slate-700 uppercase tracking-wide">Security Code (CVV)</label>
                    <input 
                      id="cvv" 
                      type="password" 
                      formControlName="cvv"
                      maxlength="3"
                      class="mt-1 block w-full px-3 py-2.5 bg-white border border-slate-200 rounded-lg text-xs md:text-sm placeholder-slate-400 focus:outline-none focus:border-brand-blue focus:ring-1 focus:ring-brand-blue transition-colors font-mono"
                      placeholder="•••"
                    />
                    <app-ui-error [show]="isFieldInvalid('cvv')" message="CVV must be 3 digits."></app-ui-error>
                  </div>
                </div>

                <!-- Submit checkout -->
                <button 
                  type="submit" 
                  [disabled]="cardForm.invalid || isProcessing() || !invoiceData()"
                  class="w-full py-3 px-4 border border-transparent rounded-lg shadow-sm text-xs font-semibold text-white bg-slate-950 hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none transition-colors"
                >
                  @if (isProcessing()) {
                    <div class="inline-block animate-spin rounded-full h-3 w-3 border-2 border-slate-400 border-t-white mr-1.5"></div>
                  }
                  Pay &#36;{{ invoiceData()?.totalAmount || '0.00' }} Securely
                </button>

              </form>
            </app-ui-card>
          </div>

        </div>
      }
    </div>
  `
})
export class PaymentComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private fb = inject(FormBuilder);
  private billingService = inject(BillingService);

  // States
  isLoadingInvoice = signal<boolean>(true);
  isProcessing = signal<boolean>(false);
  
  invoiceData = signal<Billing | null>(null);
  errorMsg = signal<string | null>(null);

  // Form
  cardForm!: FormGroup;

  // Success outcomes
  successState = signal<boolean>(false);
  transactionId = signal<string>('');
  amountCharged = signal<number>(0);
  maskedCardNumber = signal<string>('');

  ngOnInit(): void {
    this.initForm();
    this.loadInvoiceFromQuery();
  }

  initForm(): void {
    this.cardForm = this.fb.group({
      cardName: ['', [Validators.required, Validators.minLength(2)]],
      cardNumber: ['', [Validators.required, Validators.pattern(/^\d{4} \d{4} \d{4} \d{4}$/)]],
      expiry: ['', [Validators.required, Validators.pattern(/^(0[1-9]|1[0-2])\/\d{2}$/)]],
      cvv: ['', [Validators.required, Validators.pattern(/^\d{3}$/)]]
    });
  }

  loadInvoiceFromQuery(): void {
    this.isLoadingInvoice.set(true);
    this.route.queryParams.subscribe(params => {
      const resId = params['resId'];
      if (!resId) {
        this.isLoadingInvoice.set(false);
        return;
      }

      this.billingService.getBillingByReservationId(resId).subscribe({
        next: (bill) => {
          this.invoiceData.set(bill);
          this.isLoadingInvoice.set(false);
          if (bill.isPaid) {
            this.transactionId.set('ALREADY-PAID');
            this.amountCharged.set(bill.totalAmount);
            this.maskedCardNumber.set(bill.cardMasked || '•••• •••• •••• 4242');
            this.successState.set(true);
          }
        },
        error: () => {
          this.isLoadingInvoice.set(false);
        }
      });
    });
  }

  isFieldInvalid(field: string): boolean {
    const ctrl = this.cardForm.get(field);
    return !!ctrl && ctrl.invalid && (ctrl.dirty || ctrl.touched);
  }

  // Mask inputs
  maskCardNumber(event: any): void {
    let input = event.target.value.replace(/\D/g, '');
    let masked = '';
    
    for (let i = 0; i < input.length; i++) {
      if (i > 0 && i % 4 === 0) {
        masked += ' ';
      }
      masked += input[i];
    }
    
    this.cardForm.get('cardNumber')?.setValue(masked);
  }

  maskExpiry(event: any): void {
    let input = event.target.value.replace(/\D/g, '');
    let masked = '';
    
    if (input.length > 2) {
      masked = `${input.slice(0, 2)}/${input.slice(2, 4)}`;
    } else {
      masked = input;
    }
    
    this.cardForm.get('expiry')?.setValue(masked);
  }

  onSubmitPayment(): void {
    if (this.cardForm.invalid || !this.invoiceData()) return;

    this.isProcessing.set(true);
    this.errorMsg.set(null);
    const invoice = this.invoiceData()!;
    const formVals = this.cardForm.value;

    const payload = {
      reservationId: invoice.reservationId,
      cardName: formVals.cardName,
      cardNumber: formVals.cardNumber.replace(/\s+/g, ''),
      expiry: formVals.expiry,
      cvv: formVals.cvv
    };

    this.billingService.payBill(payload).subscribe({
      next: (updatedBill) => {
        this.isProcessing.set(false);
        
        // Populate outcomes
        this.transactionId.set(Math.random().toString(36).substr(2, 9).toUpperCase());
        this.amountCharged.set(updatedBill.totalAmount);
        this.maskedCardNumber.set(updatedBill.cardMasked || '•••• •••• •••• 4242');

        // Transition views
        this.successState.set(true);
      },
      error: (err) => {
        this.isProcessing.set(false);
        
        // Better error message extraction
        let msg = 'Payment failed. Please check card details and try again.';
        if (err.error) {
          if (typeof err.error === 'string') {
            msg = err.error;
          } else if (typeof err.error === 'object') {
            msg = err.error.message || err.error.error || JSON.stringify(err.error);
          }
        } else if (err.message) {
          msg = err.message;
        }

        // If it indicates the bill is already paid, treat it as success
        if (msg.toLowerCase().includes('already paid')) {
          this.transactionId.set('ALREADY-PAID');
          this.amountCharged.set(invoice.totalAmount);
          this.maskedCardNumber.set(invoice.cardMasked || '•••• •••• •••• 4242');
          this.successState.set(true);
        } else {
          this.errorMsg.set(msg);
        }
      }
    });
  }
}
