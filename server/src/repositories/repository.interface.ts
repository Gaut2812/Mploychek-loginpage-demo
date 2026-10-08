import { User } from '../models/user.model';
import { Record } from '../models/record.model';

export interface IUserRepository {
  findById(userId: string): Promise<User | null>;
  findAll(): Promise<User[]>;
  create(user: User): Promise<User>;
  update(userId: string, data: Partial<User>): Promise<User | null>;
  delete(userId: string): Promise<boolean>;
}

export interface IRecordRepository {
  findByUserId(userId: string): Promise<Record[]>;
  findAll(): Promise<Record[]>;
}
