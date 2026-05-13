import { Router } from 'express';
import {
  getAllUsers,
  createUser,
  getOneUser,
  updateUser,
  deleteUser,
  loginUser,
  getUserProfile,
  forgotPassword,
  resetPassword,
} from '../controllers/userController';
import { protect } from '../middleware/auth';

const router = Router();

// Public
router.post('/', createUser);
router.post('/login', loginUser);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password/:token', resetPassword);

// Protected
router.get('/profile', protect, getUserProfile);
router.route('/:id').get(protect, getOneUser).patch(protect, updateUser).delete(protect, deleteUser);
router.get('/', protect, getAllUsers);

export default router;
