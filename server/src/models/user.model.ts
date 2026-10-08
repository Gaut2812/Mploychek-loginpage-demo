export interface User {
  userId: string;
  passwordHash: string;
  role: 'general_user' | 'admin';
  fullName: string;
  email: string;
  department: string;
  status: 'active' | 'inactive' | 'suspended';
  createdAt: string;
  updatedAt: string;
}

export interface UserResponse {
  userId: string;
  role: 'general_user' | 'admin';
  fullName: string;
  email: string;
  department: string;
  status: 'active' | 'inactive' | 'suspended';
  createdAt: string;
  updatedAt: string;
}

export function toUserResponse(user: User): UserResponse {
  return {
    userId: user.userId,
    role: user.role,
    fullName: user.fullName,
    email: user.email,
    department: user.department,
    status: user.status,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };
}
