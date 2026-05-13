import { Router } from 'express';
import { getAllTrades, createTrade, getOneTrade } from '../controllers/tradeController';

const router = Router();

router.route('/').get(getAllTrades).post(createTrade);
router.route('/:id').get(getOneTrade);

export default router;
