import express, { Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';

import connectWithRetry from './config/database';
import userRoute from './routes/userRoute';
import orderRoute from './routes/orderRoute';
import walletRoute from './routes/walletRoute';
import depositRoute from './routes/depositRoutes';
import tradeRoute from './routes/tradeRoute';
import cryptocurrencyRoute from './routes/cryptocurrencyRoute';
import withdrawalRoute from './routes/withdrawalRoutes';
import adminRoute from './routes/adminRoute';
import { errorHandler } from './middleware/errorHandler';
import { bootstrapAdmin } from './utils/bootstrapAdmin';

dotenv.config();

const app = express();
const port = process.env.PORT ?? 3000;

app.use(helmet());
app.use(cors({ origin: process.env.CORS_ORIGIN ?? 'http://localhost:5173', credentials: true }));
app.use(express.json());

const authLimiter = rateLimit({ windowMs: 15 * 60 * 1000, limit: 20, standardHeaders: true, legacyHeaders: false });

void connectWithRetry().then(() => bootstrapAdmin());

app.get('/', (_req: Request, res: Response) => {
  res.send('CEX API');
});

app.use('/api/v1/users', authLimiter, userRoute);
app.use('/api/v1/deposits', depositRoute);
app.use('/api/v1/orders', orderRoute);
app.use('/api/v1/wallets', walletRoute);
app.use('/api/v1/trades', tradeRoute);
app.use('/api/v1/cryptocurrencies', cryptocurrencyRoute);
app.use('/api/v1/withdrawals', withdrawalRoute);
app.use('/api/v1/admin', adminRoute);

app.use(errorHandler);

app.listen(port, () => {
  console.log(`CEX API listening on port ${port}`);
});
