import { IUserRepository } from '../../repositories/repository.interface';
import { User, toUserResponse, UserResponse, normalizeRole } from '../../models/user.model';
import { hashPassword } from '../../utils/password.util';
import { ApiError } from '../../utils/api-error';
import { v4 as uuidv4 } from 'uuid';

export interface CreateUserRequest {
  userId: string;
  password: string;
  role: string;
  name?: string;
  fullName?: string;
  email: string;
  department: string;
}

export interface UpdateUserRequest {
  name?: string;
  fullName?: string;
  email?: string;
  department?: string;
  role?: string;
  status?: 'Active' | 'Inactive' | 'Suspended' | string;
  password?: string;
}

export class UsersService {
  constructor(private userRepo: IUserRepository) {}

  async getById(userId: string): Promise<UserResponse> {
    const user = await this.userRepo.findById(userId.trim());
    if (!user) {
      throw new ApiError(404, 'User not found.');
    }
    return toUserResponse(user);
  }

  async getAll(): Promise<UserResponse[]> {
    const users = await this.userRepo.findAll();
    return users.map(toUserResponse);
  }

  async create(dto: CreateUserRequest): Promise<UserResponse> {
    const displayName = dto.name || dto.fullName || '';
    if (!dto.userId || !dto.password || !dto.role || !displayName || !dto.email) {
      throw new ApiError(400, 'userId, password, role, fullName/name, and email are required.');
    }

    const existing = await this.userRepo.findById(dto.userId.trim());
    if (existing) {
      throw new ApiError(409, 'User ID already exists.');
    }

    const now = new Date().toISOString();
    const normalizedRole = normalizeRole(dto.role);

    const user: User = {
      id: dto.userId.trim() || uuidv4(),
      userId: dto.userId.trim(),
      name: displayName,
      fullName: displayName,
      email: dto.email.trim(),
      passwordHash: await hashPassword(dto.password),
      role: normalizedRole,
      department: dto.department || 'General',
      status: 'Active',
      memberSince: now,
      createdAt: now,
      updatedAt: now,
    };

    const created = await this.userRepo.create(user);
    return toUserResponse(created);
  }

  async update(userId: string, dto: UpdateUserRequest): Promise<UserResponse> {
    const updates: Partial<User> = {};

    const displayName = dto.name || dto.fullName;
    if (displayName !== undefined) {
      updates.name = displayName;
      updates.fullName = displayName;
    }
    if (dto.email !== undefined) updates.email = dto.email.trim();
    if (dto.department !== undefined) updates.department = dto.department;
    if (dto.role !== undefined) updates.role = normalizeRole(dto.role);
    if (dto.status !== undefined) updates.status = dto.status as User['status'];
    if (dto.password) updates.passwordHash = await hashPassword(dto.password);

    const updated = await this.userRepo.update(userId.trim(), updates);
    if (!updated) {
      throw new ApiError(404, 'User not found.');
    }
    return toUserResponse(updated);
  }

  async delete(userId: string): Promise<void> {
    const deleted = await this.userRepo.delete(userId.trim());
    if (!deleted) {
      throw new ApiError(404, 'User not found.');
    }
  }
}
