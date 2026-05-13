import { Router } from 'express';
import { placeOrder, cancelOrder, getOrderBook } from '../controllers/orderController';
import { protect } from '../middleware/auth';

const router = Router();

router.get('/:cryptocurrencyIdA/:cryptocurrencyIdB', getOrderBook);
router.post('/place', protect, placeOrder);
router.post('/cancel', protect, cancelOrder);

export default router;
