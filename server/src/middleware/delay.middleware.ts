import { Request, Response, NextFunction } from 'express';

/**
 * Delay middleware — adds artificial latency when ?delay=<ms> is passed.
 * Used to demonstrate async processing (skeleton loaders, progress bars).
 * Example: GET /api/users?delay=3000 adds a 3-second delay.
 */
export function delayMiddleware(req: Request, _res: Response, next: NextFunction): void {
  const delayMs = parseInt(req.query['delay'] as string, 10);

  if (delayMs && delayMs > 0 && delayMs <= 10000) {
    setTimeout(() => next(), delayMs);
  } else {
    next();
  }
}
