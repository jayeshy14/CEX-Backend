import { Router } from 'express';
import { getOrGenerateDepositAddress } from '../controllers/depositController';
import { handleEvmDeposit } from '../controllers/EVM-chains/depositController';
import { handleSolanaDeposit } from '../controllers/Solana/depositController';

const router = Router();

router.post('/getDepositAddress', getOrGenerateDepositAddress);
router.post('/handleEvmDeposit', handleEvmDeposit);
router.post('/handleSolanaDeposit', handleSolanaDeposit);

export default router;
