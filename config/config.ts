import dotenv from 'dotenv';

dotenv.config();

export const MONGO_IP: string = process.env.MONGO_IP ?? 'mongo';
export const MONGO_PORT: string = process.env.MONGO_PORT ?? '27017';
export const MONGO_USER: string | undefined = process.env.MONGO_USER;
export const MONGO_PASSWORD: string | undefined = process.env.MONGO_PASSWORD;
export const JWT_SECRET: string = process.env.JWT_SECRET ?? '';
export const GOOGLE_CLIENT_ID: string = process.env.GOOGLE_CLIENT_ID ?? '';

export default {
  MONGO_IP,
  MONGO_PORT,
  MONGO_USER,
  MONGO_PASSWORD,
  JWT_SECRET,
  GOOGLE_CLIENT_ID,
};
