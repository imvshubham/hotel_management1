import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Complaint } from '../models/complaint.model';
import { MockDataService } from './mock-data.service';

@Injectable({
  providedIn: 'root'
})
export class ComplaintService {
  private http = inject(HttpClient);
  private mockDb = inject(MockDataService);

  private useMock = false;

  submitComplaint(payload: Omit<Complaint, 'id' | 'status' | 'createdAt'>): Observable<Complaint> {
    // 🚨 BACKEND PATCH POINT
    if (this.useMock) {
      return new Observable<Complaint>(subscriber => {
        setTimeout(() => {
          const complaints = this.mockDb.getData<Complaint>('mock_complaints');
          const newId = `CMP-${Math.floor(1000 + Math.random() * 9000)}`;
          
          const newComplaint: Complaint = {
            ...payload,
            id: newId,
            status: 'PENDING',
            createdAt: new Date().toISOString()
          };

          complaints.push(newComplaint);
          this.mockDb.saveData('mock_complaints', complaints);

          subscriber.next(newComplaint);
          subscriber.complete();
        }, 1000);
      });
    }

    return this.http.post<Complaint>(`${environment.gatewayUrl}/complaints`, payload);
  }

  getComplaints(): Observable<Complaint[]> {
    // 🚨 BACKEND PATCH POINT
    if (this.useMock) {
      return new Observable<Complaint[]>(subscriber => {
        setTimeout(() => {
          const complaints = this.mockDb.getData<Complaint>('mock_complaints');
          subscriber.next(complaints);
          subscriber.complete();
        }, 800);
      });
    }

    return this.http.get<Complaint[]>(`${environment.gatewayUrl}/complaints`);
  }

  // Extra helper to update status (e.g. resolve complaint)
  resolveComplaint(id: string): Observable<Complaint> {
    // 🚨 BACKEND PATCH POINT
    if (this.useMock) {
      return new Observable<Complaint>(subscriber => {
        setTimeout(() => {
          const complaints = this.mockDb.getData<Complaint>('mock_complaints');
          const index = complaints.findIndex(c => c.id === id);
          if (index !== -1) {
            complaints[index].status = 'RESOLVED';
            this.mockDb.saveData('mock_complaints', complaints);
            subscriber.next(complaints[index]);
            subscriber.complete();
          } else {
            subscriber.error(new Error('Complaint not found.'));
          }
        }, 800);
      });
    }

    return this.http.put<Complaint>(`${environment.gatewayUrl}/complaints/${id}/resolve`, {});
  }
}
