import { Router } from 'express';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { IUserRepository } from '../../repositories/repository.interface';
import { authMiddleware } from '../../middleware/auth.middleware';
import { roleMiddleware } from '../../middleware/role.middleware';
import { delayMiddleware } from '../../middleware/delay.middleware';

export function createUserRoutes(userRepo: IUserRepository): Router {
  const router = Router();
  const service = new UsersService(userRepo);
  const controller = new UsersController(service);

  // Current user — any authenticated user
  router.get('/me', authMiddleware, delayMiddleware, controller.getMe);

  // Admin-only routes
  router.get('/', authMiddleware, roleMiddleware('admin'), delayMiddleware, controller.getAll);
  router.get('/:id', authMiddleware, roleMiddleware('admin'), delayMiddleware, controller.getById);
  router.post('/', authMiddleware, roleMiddleware('admin'), delayMiddleware, controller.create);
  router.put('/:id', authMiddleware, roleMiddleware('admin'), delayMiddleware, controller.update);
  router.delete('/:id', authMiddleware, roleMiddleware('admin'), delayMiddleware, controller.delete);

  return router;
}
