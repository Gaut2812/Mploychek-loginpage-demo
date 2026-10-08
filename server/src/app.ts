import express from 'express';
import cors from 'cors';
import { envConfig } from './config/env';
import { errorMiddleware } from './middleware/error.middleware';
import { createAuthRoutes } from './modules/auth/auth.routes';
import { createUserRoutes } from './modules/users/users.routes';
import { createRecordRoutes } from './modules/records/records.routes';
import { IUserRepository, IRecordRepository } from './repositories/repository.interface';
import { XmlUserRepository } from './repositories/xml.user.repository';
import { XmlRecordRepository } from './repositories/xml.record.repository';

function createRepositories(): { userRepo: IUserRepository; recordRepo: IRecordRepository } {
  return {
    userRepo: new XmlUserRepository(),
    recordRepo: new XmlRecordRepository(),
  };
}

export function createApp(): express.Application {
  const app = express();

  // Middleware
  app.use(cors());
  app.use(express.json());

  // Repositories (swappable via env config)
  const { userRepo, recordRepo } = createRepositories();

  // Routes
  app.use('/api/auth', createAuthRoutes(userRepo));
  app.use('/api/users', createUserRoutes(userRepo));
  app.use('/api/records', createRecordRoutes(recordRepo));

  // Health check
  app.get('/api/health', (_req, res) => {
    res.json({ status: 'ok', storage: envConfig.storageType });
  });

  // Error handler (must be last)
  app.use(errorMiddleware);

  return app;
}
