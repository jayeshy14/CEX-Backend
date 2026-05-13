import { Request, Response } from 'express';
import mongoose from 'mongoose';
import Trade from '../models/tradeModel';

export const getAllTrades = async (_req: Request, res: Response): Promise<void> => {
  try {
    const trades = await Trade.find();
    res.status(200).json({
      status: 'success',
      results: trades.length,
      data: { trades },
    });
  } catch {
    res.status(400).json({ status: 'fail' });
  }
};

export const getOneTrade = async (req: Request, res: Response): Promise<void> => {
  try {
    const tradeId = new mongoose.Types.ObjectId(String(req.params.id));
    const trade = await Trade.findById(tradeId);
    if (!trade) {
      res.status(404).json({
        status: 'fail',
        data: `trade id:${tradeId.toString()} not found`,
      });
      return;
    }

    res.status(200).json({
      status: 'success',
      data: { trade },
    });
  } catch (error) {
    console.log(error);
    res.status(400).json({ status: 'fail' });
  }
};

export const createTrade = async (req: Request, res: Response): Promise<void> => {
  const {
    amount,
    price,
    order_id,
    buyer_id,
    seller_id,
    cryptocurrency_id_A,
    cryptocurrency_id_B,
  } = req.body;
  try {
    const trade = await Trade.create({
      amount: Number(amount),
      price: Number(price),
      order_id,
      buyer_id,
      seller_id,
      cryptocurrency_id_A,
      cryptocurrency_id_B,
      created_at: new Date(),
    });

    res.status(200).json({
      status: 'success',
      data: { trade },
    });
  } catch (error) {
    console.error(error);
    res.status(400).json({ status: 'fail' });
  }
};
