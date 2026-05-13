import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

import connectWithRetry from './config/database';
import userRoute from './routes/userRoute';
import orderRoute from './routes/orderRoute';
import walletRoute from './routes/walletRoute';
import depositRoute from './routes/depositRoutes';
import tradeRoute from './routes/tradeRoute';
import cryptocurrencyRoute from './routes/cryptocurrencyRoute';

dotenv.config();

const app = express();
const port = process.env.PORT ?? 3000;

app.use(cors({ origin: process.env.CORS_ORIGIN ?? 'http://localhost:5173', credentials: true }));
app.use(express.json());

void connectWithRetry();

app.get('/', (_req: Request, res: Response) => {
  res.send('<h1>Hello World!!!</h1>');
});

app.use('/api/v1/deposits', depositRoute);
app.use('/api/v1/users', userRoute);
app.use('/api/v1/orders', orderRoute);
app.use('/api/v1/wallets', walletRoute);
app.use('/api/v1/trades', tradeRoute);
app.use('/api/v1/cryptocurrencies', cryptocurrencyRoute);

app.listen(port, () => {
  console.log(`Start server port: ${port}`);
});
