import { Request, Response, NextFunction } from 'express';
import { UsersService } from './users.service';

export class UsersController {
  constructor(private usersService: UsersService) {}

  getMe = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.user!.userId;
      const user = await this.usersService.getById(userId);
      res.status(200).json(user);
    } catch (err) {
      next(err);
    }
  };

  getAll = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const users = await this.usersService.getAll();
      res.status(200).json(users);
    } catch (err) {
      next(err);
    }
  };

  getById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const user = await this.usersService.getById(req.params['id']!);
      res.status(200).json(user);
    } catch (err) {
      next(err);
    }
  };

  create = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const user = await this.usersService.create(req.body);
      res.status(201).json(user);
    } catch (err) {
      next(err);
    }
  };

  update = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const user = await this.usersService.update(req.params['id']!, req.body);
      res.status(200).json(user);
    } catch (err) {
      next(err);
    }
  };

  delete = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      await this.usersService.delete(req.params['id']!);
      res.status(200).json({ message: 'User deleted successfully.' });
    } catch (err) {
      next(err);
    }
  };
}
