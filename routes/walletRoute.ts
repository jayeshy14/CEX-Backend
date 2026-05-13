import { Router } from 'express';
import {
  getAllWallets,
  createWallet,
  getOneWallet,
  updateWallet,
  deleteWallet,
  getMyWallet,
} from '../controllers/walletController';
import { protect } from '../middleware/auth';

const router = Router();

router.get('/me', protect, getMyWallet);
router.route('/').get(protect, getAllWallets).post(protect, createWallet);
router.route('/:id').get(protect, getOneWallet).patch(protect, updateWallet).delete(protect, deleteWallet);

export default router;
