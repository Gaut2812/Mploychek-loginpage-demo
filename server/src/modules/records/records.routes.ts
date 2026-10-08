import { Router } from 'express';
import { RecordsController } from './records.controller';
import { RecordsService } from './records.service';
import { IRecordRepository } from '../../repositories/repository.interface';
import { authMiddleware } from '../../middleware/auth.middleware';
import { delayMiddleware } from '../../middleware/delay.middleware';

export function createRecordRoutes(recordRepo: IRecordRepository): Router {
  const router = Router();
  const service = new RecordsService(recordRepo);
  const controller = new RecordsController(service);

  router.get('/', authMiddleware, delayMiddleware, controller.getRecords);

  return router;
}
