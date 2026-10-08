import { Request, Response, NextFunction } from 'express';
import { AuthService, LoginRequest } from './auth.service';

export class AuthController {
  constructor(private authService: AuthService) {}

  login = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const dto: LoginRequest = {
        userId: req.body.userId,
        password: req.body.password,
        role: req.body.role,
      };
      const result = await this.authService.login(dto);
      res.status(200).json(result);
    } catch (err) {
      next(err);
    }
  };

  getProfile = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.user!.userId;
      const user = await this.authService.getProfile(userId);
      res.status(200).json({ user });
    } catch (err) {
      next(err);
    }
  };
}
