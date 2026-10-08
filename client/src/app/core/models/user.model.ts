export interface User {
  userId: string;
  role: 'general_user' | 'admin';
  fullName: string;
  email: string;
  department: string;
  status: 'active' | 'inactive' | 'suspended';
  createdAt: string;
  updatedAt: string;
}

export interface CreateUserDto {
  userId: string;
  password: string;
  role: 'general_user' | 'admin';
  fullName: string;
  email: string;
  department: string;
}

export interface UpdateUserDto {
  fullName?: string;
  email?: string;
  department?: string;
  role?: 'general_user' | 'admin';
  status?: 'active' | 'inactive' | 'suspended';
  password?: string;
}
