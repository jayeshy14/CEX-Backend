import mongoose, { Document, Schema, Types } from 'mongoose';

export interface IUser extends Document {
  _id: Types.ObjectId;
  first_name: string;
  last_name: string;
  phone_number?: string;
  email: string;
  password?: string;
  role: 'user' | 'admin';
  chain: Types.ObjectId[];
  resetToken?: string;
  resetTokenExpiration?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const userSchema = new Schema<IUser>(
  {
    first_name: { type: String, required: true },
    last_name: { type: String, required: true },
    phone_number: { type: String, unique: true, required: false },
    email: { type: String, unique: true, required: true },
    password: { type: String, required: false },
    role: { type: String, enum: ['user', 'admin'], default: 'user' },
    chain: [{ type: Schema.Types.ObjectId, ref: 'chains' }],
    resetToken: { type: String, required: false },
    resetTokenExpiration: { type: Date, required: false },
  },
  { timestamps: true }
);

const User = mongoose.model<IUser>('users', userSchema);
export default User;
