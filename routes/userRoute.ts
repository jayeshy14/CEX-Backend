import { Router } from 'express';
import {
  getAllUsers,
  createUser,
  getOneUser,
  updateUser,
  deleteUser,
  loginUser,
  googleLogin,
  getUserProfile,
  forgotPassword,
  resetPassword,
} from '../controllers/userController';

const router = Router();

router.route('/').get(getAllUsers).post(createUser);
router.route('/:id').get(getOneUser).patch(updateUser).delete(deleteUser);

router.post('/login', loginUser);
router.post('/google-login', googleLogin);
router.get('/profile', getUserProfile);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password/:token', resetPassword);

export default router;
