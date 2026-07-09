import { Injectable } from '@angular/core';
import { User } from '../models/user.model';
import { Room } from '../models/room.model';
import { Reservation } from '../models/reservation.model';
import { Billing } from '../models/billing.model';
import { Complaint } from '../models/complaint.model';

@Injectable({
  providedIn: 'root'
})
export class MockDataService {
  constructor() {
    this.initDatabase();
  }

  private initDatabase(): void {
    // Force clear old database versions with non-Indian user data
    if (localStorage.getItem('mock_users')?.includes('John Doe')) {
      localStorage.removeItem('mock_rooms');
      localStorage.removeItem('mock_users');
      localStorage.removeItem('mock_reservations');
      localStorage.removeItem('mock_billing');
      localStorage.removeItem('mock_complaints');
    }

    if (!localStorage.getItem('mock_rooms')) {
      const defaultRooms: Room[] = [
        { id: '101', type: 'Single Room', price: 100, status: 'VACANT' },
        { id: '102', type: 'Double Room', price: 150, status: 'OCCUPIED' },
        { id: '103', type: 'Deluxe Suite', price: 250, status: 'VACANT' },
        { id: '104', type: 'Executive Penthouse', price: 500, status: 'VACANT' },
        { id: '201', type: 'Single Room', price: 100, status: 'VACANT' },
        { id: '202', type: 'Double Room', price: 150, status: 'OCCUPIED' },
        { id: '203', type: 'Deluxe Suite', price: 250, status: 'MAINTENANCE' },
        { id: '204', type: 'Executive Penthouse', price: 500, status: 'VACANT' },
      ];
      localStorage.setItem('mock_rooms', JSON.stringify(defaultRooms));
    }

    if (!localStorage.getItem('mock_users')) {
      const defaultUsers: User[] = [
        {
          id: 'USR-7734',
          username: 'customer',
          name: 'Aarav Sharma',
          email: 'aarav.sharma@example.com',
          countryCode: '+91',
          mobileNumber: '9876543210',
          address: 'Garima Park, Gandhinagar, Gujarat',
          role: 'CUSTOMER'
        },
        {
          id: 'USR-9981',
          username: 'admin',
          name: 'Sahil Upadhye',
          email: 'sahil.upadhye@hotel.com',
          countryCode: '+91',
          mobileNumber: '9999988888',
          address: 'Garima Park, Gandhinagar, Gujarat',
          role: 'ADMIN'
        }
      ];
      localStorage.setItem('mock_users', JSON.stringify(defaultUsers));
    }

    if (!localStorage.getItem('mock_reservations')) {
      const defaultReservations: Reservation[] = [
        {
          id: 'RES-8821',
          checkIn: '2026-06-01',
          checkOut: '2026-06-05',
          roomType: 'Deluxe Suite',
          customerName: 'Aarav Sharma',
          customerEmail: 'aarav.sharma@example.com',
          customerPhone: '+91 9876543210',
          customerId: 'USR-7734',
          roomNumber: '103',
          status: 'APPROVED',
          totalAmount: 1000,
          bookingDate: '2026-05-20'
        },
        {
          id: 'RES-2245',
          checkIn: '2026-06-10',
          checkOut: '2026-06-14',
          roomType: 'Executive Penthouse',
          customerName: 'Aarav Sharma',
          customerEmail: 'aarav.sharma@example.com',
          customerPhone: '+91 9876543210',
          customerId: 'USR-7734',
          roomNumber: '104',
          status: 'PENDING',
          totalAmount: 2000,
          bookingDate: '2026-05-24'
        }
      ];
      localStorage.setItem('mock_reservations', JSON.stringify(defaultReservations));
    }

    if (!localStorage.getItem('mock_billing')) {
      const defaultBilling: Billing[] = [
        {
          id: 'INV-4411',
          reservationId: 'RES-8821',
          customerId: 'USR-7734',
          roomCharges: 800,
          extraServices: 120,
          tax: 80,
          totalAmount: 1000,
          isPaid: true,
          paymentDate: '2026-05-21',
          cardMasked: '•••• •••• •••• 4242'
        },
        {
          id: 'INV-7798',
          reservationId: 'RES-2245',
          customerId: 'USR-7734',
          roomCharges: 1600,
          extraServices: 240,
          tax: 160,
          totalAmount: 2000,
          isPaid: false
        }
      ];
      localStorage.setItem('mock_billing', JSON.stringify(defaultBilling));
    }

    if (!localStorage.getItem('mock_complaints')) {
      const defaultComplaints: Complaint[] = [
        {
          id: 'CMP-1021',
          type: 'Plumbing',
          roomNumber: '102',
          contactNumber: '+91 9876543210',
          customerId: 'USR-7734',
          description: 'Sink in the bathroom is leaking.',
          status: 'PENDING',
          createdAt: '2026-05-24T10:00:00.000Z'
        }
      ];
      localStorage.setItem('mock_complaints', JSON.stringify(defaultComplaints));
    }
  }

  // Generic helpers to load and save
  getData<T>(key: string): T[] {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : [];
  }

  saveData<T>(key: string, data: T[]): void {
    localStorage.setItem(key, JSON.stringify(data));
  }
}
