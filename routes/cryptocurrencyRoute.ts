import { Router } from 'express';
import {
  getAllCryptocurrencies,
  createCryptocurrency,
  getOneCryptocurrency,
} from '../controllers/cryptocurrencyController';

const router = Router();

router.route('/').get(getAllCryptocurrencies).post(createCryptocurrency);
router.route('/:id').get(getOneCryptocurrency);

export default router;
