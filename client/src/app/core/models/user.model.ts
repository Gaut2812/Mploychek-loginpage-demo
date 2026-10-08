export type UserRole = 'General User' | 'Administrator';

export interface User {
  id: string;
  userId: string;
  name: string;
  fullName: string;
  email: string;
  role: UserRole;
  department: string;
  status: 'Active' | 'Inactive' | 'Suspended';
  memberSince: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateUserDto {
  userId: string;
  password?: string;
  role: UserRole | string;
  name?: string;
  fullName?: string;
  email: string;
  department: string;
}

export interface UpdateUserDto {
  name?: string;
  fullName?: string;
  email?: string;
  department?: string;
  role?: UserRole | string;
  status?: 'Active' | 'Inactive' | 'Suspended';
  password?: string;
}
