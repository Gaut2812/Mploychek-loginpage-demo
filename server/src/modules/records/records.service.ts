import { IRecordRepository } from '../../repositories/repository.interface';
import { Record } from '../../models/record.model';
import { normalizeRole } from '../../models/user.model';

export class RecordsService {
  constructor(private recordRepo: IRecordRepository) {}

  async getForUser(userId: string, role: string): Promise<Record[]> {
    const norm = normalizeRole(role);
    if (norm === 'Administrator') {
      return this.recordRepo.findAll();
    }
    return this.recordRepo.findByUserId(userId);
  }
}
