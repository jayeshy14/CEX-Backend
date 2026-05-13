import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { bootstrapAdmin } from '../utils/bootstrapAdmin';

dotenv.config();

const main = async (): Promise<void> => {
  const mongoUri = process.env.MONGO_URI;
  if (!mongoUri) { console.error('MONGO_URI not set'); process.exit(1); }

  const email = process.env.ADMIN_EMAIL ?? process.env.SUPER_ADMIN_EMAIL;
  const password = process.env.ADMIN_PASSWORD ?? process.env.SUPER_ADMIN_PASSWORD;

  if (!email || !password) {
    console.error('Set ADMIN_EMAIL and ADMIN_PASSWORD (or SUPER_ADMIN_EMAIL / SUPER_ADMIN_PASSWORD) in .env');
    process.exit(1);
  }

  console.log(`Bootstrapping admin: ${email}`);
  await mongoose.connect(mongoUri);
  await bootstrapAdmin();
  console.log('Admin bootstrap complete');
  await mongoose.disconnect();
};

void main().catch((err: unknown) => {
  console.error('Bootstrap failed:', err);
  process.exit(1);
});
