import { createLogger } from '@voilajs/appkit/logging';

const logger = createLogger({
  level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
  dirname: 'logs',
  filename: 'restaurant-app.log',
  retentionDays: 7,
});

export default logger;
