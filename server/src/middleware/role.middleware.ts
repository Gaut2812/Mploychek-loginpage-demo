import { Request, Response, NextFunction } from 'express';
import { normalizeRole } from '../models/user.model';

export function roleMiddleware(requiredRole: string) {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ error: 'Authentication required.' });
      return;
    }

    const userRole = normalizeRole(req.user.role);
    const targetRole = normalizeRole(requiredRole);

    if (userRole !== targetRole) {
      res.status(403).json({ error: 'Access denied. Administrator privileges required.' });
      return;
    }

    next();
  };
}
