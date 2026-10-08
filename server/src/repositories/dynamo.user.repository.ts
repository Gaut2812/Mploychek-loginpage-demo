import { IUserRepository } from './repository.interface';
import { User } from '../models/user.model';

/**
 * DynamoDB implementation of IUserRepository.
 * Uses AWS SDK v3. Activate by setting STORAGE_TYPE=dynamodb in .env.
 *
 * Table design (single-table):
 *   PK: USER#<userId>   SK: PROFILE
 *   GSI_Role — PK: role, SK: createdAt
 */
export class DynamoUserRepository implements IUserRepository {
  // Placeholder — implement with @aws-sdk/client-dynamodb when deploying to AWS
  async findById(_userId: string): Promise<User | null> {
    throw new Error('DynamoDB repository not yet configured. Set STORAGE_TYPE=xml in .env.');
  }

  async findAll(): Promise<User[]> {
    throw new Error('DynamoDB repository not yet configured. Set STORAGE_TYPE=xml in .env.');
  }

  async create(_user: User): Promise<User> {
    throw new Error('DynamoDB repository not yet configured. Set STORAGE_TYPE=xml in .env.');
  }

  async update(_userId: string, _data: Partial<User>): Promise<User | null> {
    throw new Error('DynamoDB repository not yet configured. Set STORAGE_TYPE=xml in .env.');
  }

  async delete(_userId: string): Promise<boolean> {
    throw new Error('DynamoDB repository not yet configured. Set STORAGE_TYPE=xml in .env.');
  }
}
