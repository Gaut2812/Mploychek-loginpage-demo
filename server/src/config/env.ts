import dotenv from 'dotenv';
dotenv.config();

export interface EnvConfig {
  port: number;
  jwtSecret: string;
  jwtExpiresIn: string;
  storageType: 'xml';
}

export const envConfig: EnvConfig = {
  port: parseInt(process.env['PORT'] || '3000', 10),
  jwtSecret: process.env['JWT_SECRET'] || 'default-secret',
  jwtExpiresIn: process.env['JWT_EXPIRES_IN'] || '24h',
  storageType: 'xml',
};
