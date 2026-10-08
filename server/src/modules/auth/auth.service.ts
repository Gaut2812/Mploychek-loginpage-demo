import { IUserRepository } from '../../repositories/repository.interface';
import { comparePassword } from '../../utils/password.util';
import { signToken } from '../../utils/jwt.util';
import { toUserResponse, UserResponse, normalizeRole } from '../../models/user.model';
import { ApiError } from '../../utils/api-error';

export interface LoginRequest {
  userId: string;
  password: string;
  role?: string;
}

export interface LoginResponse {
  success: boolean;
  token: string;
  user: UserResponse;
}

export class AuthService {
  constructor(private userRepo: IUserRepository) {}

  async login(dto: LoginRequest): Promise<LoginResponse> {
    if (!dto.userId || !dto.password) {
      throw new ApiError(400, 'User ID and password are required.');
    }

    const user = await this.userRepo.findById(dto.userId.trim());

    if (!user) {
      throw new ApiError(401, 'Invalid user ID. User not found.');
    }

    const passwordValid = await comparePassword(dto.password, user.passwordHash);
    if (!passwordValid) {
      throw new ApiError(401, 'Invalid password.');
    }

    const userRole = normalizeRole(user.role);

    if (dto.role) {
      const requestedRole = normalizeRole(dto.role);
      if (userRole !== requestedRole) {
        throw new ApiError(
          401,
          `Incorrect role. User "${dto.userId}" is registered as "${userRole}", not "${dto.role}".`
        );
      }
    }

    if (user.status && user.status.toLowerCase() !== 'active') {
      throw new ApiError(403, `Account is currently ${user.status}.`);
    }

    const token = signToken({ userId: user.userId, role: userRole });

    return {
      success: true,
      token,
      user: toUserResponse(user),
    };
  }

  async getProfile(userId: string): Promise<UserResponse> {
    const user = await this.userRepo.findById(userId);
    if (!user) {
      throw new ApiError(404, 'User not found.');
    }
    return toUserResponse(user);
  }
}
