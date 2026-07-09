export type ReservationStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

export interface Reservation {
  id: string;
  checkIn: string;
  checkOut: string;
  roomType: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  customerId: string;
  roomNumber?: string;
  status: ReservationStatus;
  totalAmount: number;
  bookingDate: string;
}
