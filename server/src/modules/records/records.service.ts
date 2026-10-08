import { IRecordRepository } from '../../repositories/repository.interface';
import { Record } from '../../models/record.model';

export class RecordsService {
  constructor(private recordRepo: IRecordRepository) {}

  async getForUser(userId: string, role: string): Promise<Record[]> {
    if (role === 'admin') {
      return this.recordRepo.findAll();
    }
    return this.recordRepo.findByUserId(userId);
  }
}
