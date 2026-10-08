import { IRecordRepository } from './repository.interface';
import { Record } from '../models/record.model';

/**
 * DynamoDB implementation of IRecordRepository.
 * Table design: PK: USER#<userId>  SK: RECORD#<recordId>
 */
export class DynamoRecordRepository implements IRecordRepository {
  async findByUserId(_userId: string): Promise<Record[]> {
    throw new Error('DynamoDB repository not yet configured. Set STORAGE_TYPE=xml in .env.');
  }

  async findAll(): Promise<Record[]> {
    throw new Error('DynamoDB repository not yet configured. Set STORAGE_TYPE=xml in .env.');
  }
}
