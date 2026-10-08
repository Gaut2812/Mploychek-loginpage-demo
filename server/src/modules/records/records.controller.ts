import { Request, Response, NextFunction } from 'express';
import { RecordsService } from './records.service';

export class RecordsController {
  constructor(private recordsService: RecordsService) {}

  getRecords = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.user!.userId;
      const role = req.user!.role;
      const records = await this.recordsService.getForUser(userId, role);
      res.status(200).json(records);
    } catch (err) {
      next(err);
    }
  };
}
