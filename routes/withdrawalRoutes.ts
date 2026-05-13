import { Router } from 'express';
import { handleWithdrawal } from '../controllers/withdrawalController';
import { protect } from '../middleware/auth';

const router = Router();

router.post('/withdraw', protect, handleWithdrawal);

export default router;
