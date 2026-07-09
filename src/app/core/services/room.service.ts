import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Room, RoomStatus } from '../models/room.model';
import { MockDataService } from './mock-data.service';

@Injectable({
  providedIn: 'root'
})
export class RoomService {
  private http = inject(HttpClient);
  private mockDb = inject(MockDataService);

  private useMock = false;

  getRooms(): Observable<Room[]> {
    // 🚨 BACKEND PATCH POINT
    if (this.useMock) {
      return new Observable<Room[]>(subscriber => {
        setTimeout(() => {
          const rooms = this.mockDb.getData<Room>('mock_rooms');
          subscriber.next(rooms);
          subscriber.complete();
        }, 600);
      });
    }

    return this.http.get<Room[]>(`${environment.gatewayUrl}/rooms`);
  }

  updateRoomStatus(id: string, status: RoomStatus): Observable<Room> {
    // 🚨 BACKEND PATCH POINT
    if (this.useMock) {
      return new Observable<Room>(subscriber => {
        setTimeout(() => {
          const rooms = this.mockDb.getData<Room>('mock_rooms');
          const index = rooms.findIndex(r => r.id === id);
          if (index !== -1) {
            rooms[index].status = status;
            this.mockDb.saveData('mock_rooms', rooms);
            subscriber.next(rooms[index]);
            subscriber.complete();
          } else {
            subscriber.error(new Error('Room not found.'));
          }
        }, 800);
      });
    }

    return this.http.put<Room>(`${environment.gatewayUrl}/rooms/${id}/status`, { status });
  }
}
