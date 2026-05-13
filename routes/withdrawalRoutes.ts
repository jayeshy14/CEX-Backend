import { Router } from 'express';
import { handleWithdrawal } from '../controllers/withdrawalController';

const router = Router();

router.post('/withdraw', handleWithdrawal);

export default router;
