import { IUserRepository } from '../../repositories/repository.interface';
import { User, toUserResponse, UserResponse } from '../../models/user.model';
import { hashPassword } from '../../utils/password.util';
import { ApiError } from '../../utils/api-error';
import { v4 as uuidv4 } from 'uuid';

export interface CreateUserRequest {
  userId: string;
  password: string;
  role: 'general_user' | 'admin';
  fullName: string;
  email: string;
  department: string;
}

export interface UpdateUserRequest {
  fullName?: string;
  email?: string;
  department?: string;
  role?: 'general_user' | 'admin';
  status?: 'active' | 'inactive' | 'suspended';
  password?: string;
}

export class UsersService {
  constructor(private userRepo: IUserRepository) {}

  async getById(userId: string): Promise<UserResponse> {
    const user = await this.userRepo.findById(userId);
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
    if (!dto.userId || !dto.password || !dto.role || !dto.fullName || !dto.email) {
      throw new ApiError(400, 'userId, password, role, fullName, and email are required.');
    }

    const existing = await this.userRepo.findById(dto.userId);
    if (existing) {
      throw new ApiError(409, 'User ID already exists.');
    }

    const now = new Date().toISOString();
    const user: User = {
      userId: dto.userId || uuidv4(),
      passwordHash: await hashPassword(dto.password),
      role: dto.role,
      fullName: dto.fullName,
      email: dto.email,
      department: dto.department || '',
      status: 'active',
      createdAt: now,
      updatedAt: now,
    };

    const created = await this.userRepo.create(user);
    return toUserResponse(created);
  }

  async update(userId: string, dto: UpdateUserRequest): Promise<UserResponse> {
    const updates: Partial<User> = {};

    if (dto.fullName !== undefined) updates.fullName = dto.fullName;
    if (dto.email !== undefined) updates.email = dto.email;
    if (dto.department !== undefined) updates.department = dto.department;
    if (dto.role !== undefined) updates.role = dto.role;
    if (dto.status !== undefined) updates.status = dto.status;
    if (dto.password) updates.passwordHash = await hashPassword(dto.password);

    const updated = await this.userRepo.update(userId, updates);
    if (!updated) {
      throw new ApiError(404, 'User not found.');
    }
    return toUserResponse(updated);
  }

  async delete(userId: string): Promise<void> {
    const deleted = await this.userRepo.delete(userId);
    if (!deleted) {
      throw new ApiError(404, 'User not found.');
    }
  }
}
