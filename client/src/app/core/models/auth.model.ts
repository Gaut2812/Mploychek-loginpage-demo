import { User } from './user.model';

export interface LoginCredentials {
  userId: string;
  password: string;
  role: 'general_user' | 'admin';
}

export interface LoginResponse {
  token: string;
  user: User;
}
