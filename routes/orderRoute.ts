import { Router } from 'express';
import { placeOrder, cancelOrder, getOrderBook } from '../controllers/orderController';

const router = Router();

router.post('/place', placeOrder);
router.post('/cancel', cancelOrder);
router.get('/:cryptocurrencyIdA/:cryptocurrencyIdB', getOrderBook);

export default router;
