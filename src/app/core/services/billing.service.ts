import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Billing } from '../models/billing.model';
import { MockDataService } from './mock-data.service';

@Injectable({
  providedIn: 'root'
})
export class BillingService {
  private http = inject(HttpClient);
  private mockDb = inject(MockDataService);

  private useMock = false;

  getAllInvoices(): Observable<Billing[]> {
    // 🚨 BACKEND PATCH POINT
    if (this.useMock) {
      return of(this.mockDb.getData<Billing>('mock_billing'));
    }
    return this.http.get<Billing[]>(`${environment.gatewayUrl}/billing`);
  }

  getBillingByReservationId(reservationId: string): Observable<Billing> {
    // 🚨 BACKEND PATCH POINT
    if (this.useMock) {
      return new Observable<Billing>(subscriber => {
        setTimeout(() => {
          const billings = this.mockDb.getData<Billing>('mock_billing');
          const bill = billings.find(b => b.reservationId === reservationId);
          if (bill) {
            subscriber.next(bill);
            subscriber.complete();
          } else {
            subscriber.error(new Error('Billing not found for this reservation.'));
          }
        }, 700);
      });
    }

    return this.http.get<Billing>(`${environment.gatewayUrl}/billing/${reservationId}`);
  }

  payBill(payload: { reservationId: string; cardName: string; cardNumber: string; expiry: string; cvv: string }): Observable<Billing> {
    // 🚨 BACKEND PATCH POINT
    if (this.useMock) {
      return new Observable<Billing>(subscriber => {
        setTimeout(() => {
          const billings = this.mockDb.getData<Billing>('mock_billing');
          const index = billings.findIndex(b => b.reservationId === payload.reservationId);
          if (index !== -1) {
            const maskedCard = `•••• •••• •••• ${payload.cardNumber.slice(-4)}`;
            billings[index].isPaid = true;
            billings[index].paymentDate = new Date().toISOString().split('T')[0];
            billings[index].cardMasked = maskedCard;

            this.mockDb.saveData('mock_billing', billings);
            subscriber.next(billings[index]);
            subscriber.complete();
          } else {
            subscriber.error(new Error('Invoice not found.'));
          }
        }, 1200);
      });
    }

    return this.http.post<Billing>(`${environment.gatewayUrl}/billing/pay`, payload);
  }

  getInvoiceById(id: string): Observable<Billing> {
    // 🚨 BACKEND PATCH POINT
    if (this.useMock) {
      return new Observable<Billing>(subscriber => {
        setTimeout(() => {
          const billings = this.mockDb.getData<Billing>('mock_billing');
          const bill = billings.find(b => b.id === id);
          if (bill) {
            subscriber.next(bill);
            subscriber.complete();
          } else {
            subscriber.error(new Error('Invoice not found.'));
          }
        }, 600);
      });
    }

    return this.http.get<Billing>(`${environment.gatewayUrl}/billing/invoice/${id}`);
  }

  // Admin invoice generation
  generateInvoice(reservationId: string): Observable<Billing> {
    // 🚨 BACKEND PATCH POINT
    if (this.useMock) {
      return new Observable<Billing>(subscriber => {
        setTimeout(() => {
          const billings = this.mockDb.getData<Billing>('mock_billing');
          let bill = billings.find(b => b.reservationId === reservationId);

          if (bill) {
            subscriber.next(bill);
            subscriber.complete();
            return;
          }

          // Create new bill if it didn't exist
          const newBillId = `INV-${Math.floor(1000 + Math.random() * 9000)}`;
          const newBill: Billing = {
            id: newBillId,
            reservationId,
            customerId: 'USR-7734', // default fallback customer
            roomCharges: 400,
            extraServices: 50,
            tax: 50,
            totalAmount: 500,
            isPaid: false
          };

          billings.push(newBill);
          this.mockDb.saveData('mock_billing', billings);
          subscriber.next(newBill);
          subscriber.complete();
        }, 1000);
      });
    }

    return this.http.post<Billing>(`${environment.gatewayUrl}/billing/generate`, { reservationId });
  }
}
