import { Router } from 'express';
import { placeOrder, cancelOrder, getOrderBook, getMyOrders } from '../controllers/orderController';
import { protect } from '../middleware/auth';

const router = Router();

router.get('/my', protect, getMyOrders);
router.get('/:cryptocurrencyIdA/:cryptocurrencyIdB', getOrderBook);
router.post('/place', protect, placeOrder);
router.post('/cancel', protect, cancelOrder);

export default router;
