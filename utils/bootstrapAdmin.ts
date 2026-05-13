import bcrypt from 'bcryptjs';
import User from '../models/userModel';

export const bootstrapAdmin = async (): Promise<void> => {
  const email = process.env.ADMIN_EMAIL;
  const password = process.env.ADMIN_PASSWORD;

  if (!email || !password) return;

  const existing = await User.findOne({ email });

  if (existing) {
    if (existing.role !== 'admin') {
      existing.role = 'admin';
      await existing.save();
      console.log(`[admin] Promoted ${email} to admin`);
    }
    return;
  }

  const hashed = await bcrypt.hash(password, 12);
  await User.create({
    first_name: 'Super',
    last_name: 'Admin',
    email,
    password: hashed,
    role: 'admin',
  });

  console.log(`[admin] Super admin created: ${email}`);
};
