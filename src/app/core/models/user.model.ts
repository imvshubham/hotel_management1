export type UserRole = 'CUSTOMER' | 'ADMIN';

export interface User {
  id: string;
  username: string;
  name: string;
  email: string;
  countryCode: string;
  mobileNumber: string;
  address: string;
  role: UserRole;
}

export interface AuthResponse {
  token: string;
  user: User;
}
