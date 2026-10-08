import { User } from './user.model';

export interface LoginCredentials {
  userId: string;
  password: string;
  role?: string;
}

export interface LoginResponse {
  success: boolean;
  token: string;
  user: User;
}
