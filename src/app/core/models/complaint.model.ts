export interface Complaint {
  id: string;
  type: string; // Plumbing, Electrical, Cleaning, Noise, Other
  roomNumber: string;
  contactNumber: string;
  customerId: string;
  description?: string;
  status: 'PENDING' | 'RESOLVED';
  createdAt: string;
}
