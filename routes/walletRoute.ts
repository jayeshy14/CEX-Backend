import { Router } from 'express';
import {
  getAllWallets,
  createWallet,
  getOneWallet,
  updateWallet,
  deleteWallet,
} from '../controllers/walletController';
import { protect } from '../middleware/auth';

const router = Router();

router.route('/').get(protect, getAllWallets).post(protect, createWallet);
router.route('/:id').get(protect, getOneWallet).patch(protect, updateWallet).delete(protect, deleteWallet);

export default router;
