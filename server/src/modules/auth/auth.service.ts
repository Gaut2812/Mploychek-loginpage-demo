import { IUserRepository } from '../../repositories/repository.interface';
import { comparePassword } from '../../utils/password.util';
import { signToken } from '../../utils/jwt.util';
import { toUserResponse, UserResponse } from '../../models/user.model';
import { ApiError } from '../../utils/api-error';

export interface LoginRequest {
  userId: string;
  password: string;
  role: 'general_user' | 'admin';
}

export interface LoginResponse {
  token: string;
  user: UserResponse;
}

export class AuthService {
  constructor(private userRepo: IUserRepository) {}

  async login(dto: LoginRequest): Promise<LoginResponse> {
    if (!dto.userId || !dto.password || !dto.role) {
      throw new ApiError(400, 'User ID, password, and role are required.');
    }

    const user = await this.userRepo.findById(dto.userId);

    if (!user) {
      throw new ApiError(401, 'Invalid credentials.');
    }

    const passwordValid = await comparePassword(dto.password, user.passwordHash);
    if (!passwordValid) {
      throw new ApiError(401, 'Invalid credentials.');
    }

    if (user.role !== dto.role) {
      throw new ApiError(401, 'Invalid role for this user.');
    }

    if (user.status !== 'active') {
      throw new ApiError(403, 'Account is not active.');
    }

    const token = signToken({ userId: user.userId, role: user.role });
    return { token, user: toUserResponse(user) };
  }
}
