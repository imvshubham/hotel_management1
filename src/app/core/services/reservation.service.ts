import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Reservation, ReservationStatus } from '../models/reservation.model';
import { MockDataService } from './mock-data.service';
import { Room } from '../models/room.model';

@Injectable({
  providedIn: 'root'
})
export class ReservationService {
  private http = inject(HttpClient);
  private mockDb = inject(MockDataService);

  private useMock = false;

  createReservation(payload: Omit<Reservation, 'id' | 'status' | 'bookingDate' | 'roomNumber'>): Observable<Reservation> {
    // 🚨 BACKEND PATCH POINT
    if (this.useMock) {
      return new Observable<Reservation>(subscriber => {
        setTimeout(() => {
          const reservations = this.mockDb.getData<Reservation>('mock_reservations');
          const newId = `RES-${Math.floor(1000 + Math.random() * 9000)}`;
          
          const newReservation: Reservation = {
            ...payload,
            id: newId,
            status: 'PENDING',
            bookingDate: new Date().toISOString().split('T')[0]
          };

          reservations.push(newReservation);
          this.mockDb.saveData('mock_reservations', reservations);

          // Auto-generate a pending invoice in mock database
          const billings = this.mockDb.getData<any>('mock_billing');
          const billingId = `INV-${Math.floor(1000 + Math.random() * 9000)}`;
          billings.push({
            id: billingId,
            reservationId: newId,
            customerId: payload.customerId,
            roomCharges: payload.totalAmount * 0.8,
            extraServices: payload.totalAmount * 0.12,
            tax: payload.totalAmount * 0.08,
            totalAmount: payload.totalAmount,
            isPaid: false
          });
          this.mockDb.saveData('mock_billing', billings);

          subscriber.next(newReservation);
          subscriber.complete();
        }, 1000);
      });
    }

    return this.http.post<Reservation>(`${environment.gatewayUrl}/reservations`, payload);
  }

  getReservations(): Observable<Reservation[]> {
    // 🚨 BACKEND PATCH POINT
    if (this.useMock) {
      return new Observable<Reservation[]>(subscriber => {
        setTimeout(() => {
          const reservations = this.mockDb.getData<Reservation>('mock_reservations');
          subscriber.next(reservations);
          subscriber.complete();
        }, 800);
      });
    }

    return this.http.get<Reservation[]>(`${environment.gatewayUrl}/reservations`);
  }

  getReservationById(id: string): Observable<Reservation> {
    // 🚨 BACKEND PATCH POINT
    if (this.useMock) {
      return new Observable<Reservation>(subscriber => {
        setTimeout(() => {
          const reservations = this.mockDb.getData<Reservation>('mock_reservations');
          const res = reservations.find(r => r.id === id);
          if (res) {
            subscriber.next(res);
            subscriber.complete();
          } else {
            subscriber.error(new Error('Reservation not found.'));
          }
        }, 600);
      });
    }

    return this.http.get<Reservation>(`${environment.gatewayUrl}/reservations/${id}`);
  }

  // Admin approval/rejection & room assignment
  updateReservationStatus(id: string, status: ReservationStatus, roomNumber?: string): Observable<Reservation> {
    // 🚨 BACKEND PATCH POINT
    if (this.useMock) {
      return new Observable<Reservation>(subscriber => {
        setTimeout(() => {
          const reservations = this.mockDb.getData<Reservation>('mock_reservations');
          const index = reservations.findIndex(r => r.id === id);
          if (index !== -1) {
            reservations[index].status = status;
            if (roomNumber) {
              reservations[index].roomNumber = roomNumber;
              
              // Also update room status to OCCUPIED if approved
              const rooms = this.mockDb.getData<Room>('mock_rooms');
              const roomIdx = rooms.findIndex(rm => rm.id === roomNumber);
              if (roomIdx !== -1 && status === 'APPROVED') {
                rooms[roomIdx].status = 'OCCUPIED';
                this.mockDb.saveData('mock_rooms', rooms);
              }
            }
            this.mockDb.saveData('mock_reservations', reservations);
            subscriber.next(reservations[index]);
            subscriber.complete();
          } else {
            subscriber.error(new Error('Reservation not found.'));
          }
        }, 1000);
      });
    }

    // Usually maps to PUT or PATCH endpoint, depending on microservice spec
    return this.http.put<Reservation>(`${environment.gatewayUrl}/reservations/${id}/status`, { status, roomNumber });
  }
}
