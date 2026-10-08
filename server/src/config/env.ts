import dotenv from 'dotenv';
dotenv.config();

export interface EnvConfig {
  port: number;
  jwtSecret: string;
  jwtExpiresIn: string;
  storageType: 'xml' | 'dynamodb';
  awsRegion: string;
  dynamoTableName: string;
}

export const envConfig: EnvConfig = {
  port: parseInt(process.env['PORT'] || '3000', 10),
  jwtSecret: process.env['JWT_SECRET'] || 'default-secret',
  jwtExpiresIn: process.env['JWT_EXPIRES_IN'] || '24h',
  storageType: (process.env['STORAGE_TYPE'] as 'xml' | 'dynamodb') || 'xml',
  awsRegion: process.env['AWS_REGION'] || 'us-east-1',
  dynamoTableName: process.env['DYNAMODB_TABLE'] || 'MployChek',
};
