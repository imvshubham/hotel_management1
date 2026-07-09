import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { Reservation } from '../models/reservation.model';
import { MockDataService } from './mock-data.service';

@Injectable({
  providedIn: 'root'
})
export class HistoryService {
  private http = inject(HttpClient);
  private mockDb = inject(MockDataService);

  private useMock = false;

  getUserHistory(userId: string): Observable<Reservation[]> {
    // 🚨 BACKEND PATCH POINT
    if (this.useMock) {
      return new Observable<Reservation[]>(subscriber => {
        setTimeout(() => {
          const reservations = this.mockDb.getData<Reservation>('mock_reservations');
          // For history, return reservations belonging to user (e.g. APPROVED or REJECTED or even pending)
          const filtered = reservations.filter(r => r.customerId === userId);
          subscriber.next(filtered);
          subscriber.complete();
        }, 700);
      });
    }

    return this.http.get<Reservation[]>(`${environment.gatewayUrl}/history/user/${userId}`);
  }

  getAllHistory(): Observable<Reservation[]> {
    // 🚨 BACKEND PATCH POINT
    if (this.useMock) {
      return new Observable<Reservation[]>(subscriber => {
        setTimeout(() => {
          const reservations = this.mockDb.getData<Reservation>('mock_reservations');
          subscriber.next(reservations);
          subscriber.complete();
        }, 900);
      });
    }

    return this.http.get<Reservation[]>(`${environment.gatewayUrl}/history/all`);
  }
}
