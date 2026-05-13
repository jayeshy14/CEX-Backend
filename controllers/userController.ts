import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import nodemailer from 'nodemailer';
import crypto from 'crypto';

import User from '../models/userModel';
import Wallet from '../models/walletModel';
import Order from '../models/orderModel';
import { JWT_SECRET } from '../config/config';

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

export const getUserProfile = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?._id ?? req.body.userId ?? req.query.userId;
    if (!userId) {
      res.status(400).json({ status: 'fail', message: 'User ID is required' });
      return;
    }

    const user = await User.findById(userId);
    if (!user) {
      res.status(404).json({ status: 'fail', message: 'User not found' });
      return;
    }

    const wallet = await Wallet.findOne({ user_id: userId });
    const orderHistory = await Order.find({ user_id: userId, status: { $in: ['filled', 'canceled'] } });
    const openOrders = await Order.find({ user_id: userId, status: 'open' });

    res.status(200).json({
      status: 'success',
      data: { user, wallet, orderHistory, openOrders },
    });
  } catch {
    res.status(500).json({ status: 'fail', message: 'Error fetching user profile' });
  }
};

export const createUser = async (req: Request, res: Response): Promise<void> => {
  const { firstName, lastName, phoneNumber, email, password, confirmPassword } = req.body;

  try {
    if (!firstName || !lastName || !phoneNumber || !email || !password || !confirmPassword) {
      res.status(400).json({ message: 'All fields are required' });
      return;
    }

    if (password !== confirmPassword) {
      res.status(400).json({ message: 'Passwords do not match' });
      return;
    }

    if (await User.findOne({ email })) {
      res.status(400).json({ message: 'User already exists' });
      return;
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      first_name: firstName,
      last_name: lastName,
      phone_number: phoneNumber,
      email,
      password: hashedPassword,
    });

    await Wallet.create({ user_id: user._id, usd_balance: 0 });

    const token = jwt.sign({ id: user._id.toString() }, JWT_SECRET, { expiresIn: '365d' });

    res.status(201).json({ token });
  } catch (error) {
    const msg = error instanceof Error ? error.message : 'Unknown error';
    res.status(500).json({ message: 'Server error', error: msg });
  }
};

export const loginUser = async (req: Request, res: Response): Promise<void> => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user || !user.password || !(await bcrypt.compare(password, user.password))) {
      res.status(400).json({ message: 'Invalid credentials' });
      return;
    }

    const token = jwt.sign({ id: user._id.toString() }, JWT_SECRET, { expiresIn: '365d' });

    res.status(200).json({ status: 'success', token, userId: user._id, role: user.role });
  } catch {
    res.status(500).send('Server error');
  }
};

export const forgotPassword = async (req: Request, res: Response): Promise<void> => {
  const { email } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }

    const token = crypto.randomBytes(32).toString('hex');
    const expiration = new Date(Date.now() + 3600000);

    user.resetToken = token;
    user.resetTokenExpiration = expiration;
    await user.save();

    const resetUrl = `http://localhost:5173/reset-password/${token}`;
    await transporter.sendMail({
      to: email,
      subject: 'Password Reset Request',
      text: `To reset your password, click the link below:\n\n${resetUrl}`,
    });

    res.status(200).json({ message: 'Password reset link has been sent to your email' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Something went wrong, please try again later' });
  }
};

export const resetPassword = async (req: Request, res: Response): Promise<void> => {
  const { token } = req.params;
  const { password } = req.body;

  try {
    const user = await User.findOne({
      resetToken: token,
      resetTokenExpiration: { $gt: new Date() },
    });

    if (!user) {
      res.status(400).json({ message: 'Invalid or expired token' });
      return;
    }

    const hashedPassword = await bcrypt.hash(password, 12);
    user.password = hashedPassword;
    user.resetToken = undefined;
    user.resetTokenExpiration = undefined;
    await user.save();

    res.status(200).json({ message: 'Password has been reset successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Something went wrong, please try again later' });
  }
};

export const getAllUsers = async (_req: Request, res: Response): Promise<void> => {
  try {
    const users = await User.find();
    res.status(200).json({ status: 'success', results: users.length, data: { users } });
  } catch {
    res.status(400).json({ status: 'fail' });
  }
};

export const getOneUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      res.status(404).json({ status: 'fail', message: 'User not found' });
      return;
    }

    const wallet = await Wallet.findOne({ user_id: user._id });
    const orderHistory = await Order.find({ user_id: user._id, status: { $in: ['filled', 'canceled'] } });
    const openOrders = await Order.find({ user_id: user._id, status: 'open' });

    res.status(200).json({ status: 'success', data: { user, wallet, orderHistory, openOrders } });
  } catch {
    res.status(500).json({ status: 'fail', message: 'Error fetching user details' });
  }
};

export const updateUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { ...req.body, updated_at: new Date() },
      { new: true, runValidators: true }
    );

    res.status(200).json({ status: 'success', data: { user } });
  } catch {
    res.status(400).json({ status: 'fail' });
  }
};

export const deleteUser = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!(await User.findById(req.params.id))) {
      res.status(404).json({ status: 'fail', message: 'User not found' });
      return;
    }
    await User.findByIdAndDelete(req.params.id);
    res.status(200).json({ status: 'success' });
  } catch {
    res.status(400).json({ status: 'fail' });
  }
};
