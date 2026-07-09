export type RoomStatus = 'VACANT' | 'OCCUPIED' | 'MAINTENANCE';

export interface Room {
  id: string; // Room number
  type: string; // Suite, Deluxe, Single, Double
  price: number;
  status: RoomStatus;
}
