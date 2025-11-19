import dotenv from 'dotenv';
dotenv.config();

export const config = {
  port: process.env.PORT || 5001,
  dbServiceUrl: process.env.DATABASE_SERVICE_URL || 'http://localhost:3000',
  notifServiceUrl: process.env.NOTIFICATIONS_SERVICE_URL || 'http://localhost:5003'
};