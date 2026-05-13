import { Router } from 'express';
import {
  getAllWallets,
  createWallet,
  getOneWallet,
  updateWallet,
  deleteWallet,
} from '../controllers/walletController';

const router = Router();

router.route('/').get(getAllWallets).post(createWallet);
router.route('/:id').get(getOneWallet).patch(updateWallet).delete(deleteWallet);

export default router;
