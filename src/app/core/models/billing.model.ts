export interface Billing {
  id: string;
  reservationId: string;
  customerId: string;
  roomCharges: number;
  extraServices: number;
  tax: number;
  totalAmount: number;
  isPaid: boolean;
  paymentDate?: string;
  cardMasked?: string;
}
