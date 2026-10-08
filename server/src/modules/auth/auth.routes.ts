import { Router } from 'express';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { IUserRepository } from '../../repositories/repository.interface';
import { authMiddleware } from '../../middleware/auth.middleware';

export function createAuthRoutes(userRepo: IUserRepository): Router {
  const router = Router();
  const service = new AuthService(userRepo);
  const controller = new AuthController(service);

  router.post('/login', controller.login);
  router.get('/profile', authMiddleware, controller.getProfile);

  return router;
}
