import { createApp } from './app';
import { envConfig } from './config/env';

const app = createApp();

if (process.env['NODE_ENV'] !== 'production' || !process.env['VERCEL']) {
  app.listen(envConfig.port, () => {
    console.log(`MployChek API running on http://localhost:${envConfig.port}`);
    console.log(`Storage: ${envConfig.storageType}`);
  });
}

export default app;
