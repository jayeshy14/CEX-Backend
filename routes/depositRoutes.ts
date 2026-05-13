import { Router } from 'express';
import { getOrGenerateDepositAddress } from '../controllers/depositController';
import { handleEvmDeposit } from '../controllers/EVM-chains/depositController';
import { handleSolanaDeposit } from '../controllers/Solana/depositController';
import { protect } from '../middleware/auth';

const router = Router();

// Webhook endpoints — authenticated by Alchemy/Helius shared secret, not JWT
router.post('/handleEvmDeposit', handleEvmDeposit);
router.post('/handleSolanaDeposit', handleSolanaDeposit);

router.post('/getDepositAddress', protect, getOrGenerateDepositAddress);

export default router;
