export type UserRole = 'General User' | 'Administrator';

export function normalizeRole(role: string): UserRole {
  const r = (role || '').trim().toLowerCase();
  if (r === 'admin' || r === 'administrator') {
    return 'Administrator';
  }
  return 'General User';
}

export interface User {
  id: string;
  userId: string;
  name: string;
  fullName: string;
  email: string;
  passwordHash: string;
  role: UserRole;
  department: string;
  status: 'Active' | 'Inactive' | 'Suspended';
  memberSince: string;
  createdAt: string;
  updatedAt: string;
}

export interface UserResponse {
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

export function toUserResponse(user: User): UserResponse {
  const normRole = normalizeRole(user.role);
  const displayName = user.name || user.fullName || user.userId;
  const joined = user.memberSince || user.createdAt || new Date().toISOString();

  return {
    id: user.id || user.userId,
    userId: user.userId,
    name: displayName,
    fullName: displayName,
    email: user.email,
    role: normRole,
    department: user.department,
    status: (user.status || 'Active') as User['status'],
    memberSince: joined,
    createdAt: user.createdAt || joined,
    updatedAt: user.updatedAt || user.createdAt || joined,
  };
}
