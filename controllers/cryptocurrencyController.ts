import { Request, Response } from 'express';
import mongoose from 'mongoose';
import Cryptocurrency from '../models/cryptocurrencyModel';

export const getAllCryptocurrencies = async (_req: Request, res: Response): Promise<void> => {
  try {
    const cryptocurrencies = await Cryptocurrency.find();
    res.status(200).json({
      status: 'success',
      results: cryptocurrencies.length,
      data: { cryptocurrencies },
    });
  } catch (error) {
    const msg = error instanceof Error ? error.message : 'Unknown error';
    res.status(500).json({ status: 'fail', message: msg });
  }
};

export const getOneCryptocurrency = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = String(req.params.id);
    let cryptocurrency;

    if (mongoose.Types.ObjectId.isValid(id)) {
      cryptocurrency = await Cryptocurrency.findById(id);
    } else {
      cryptocurrency = await Cryptocurrency.findOne({ symbol: id.toUpperCase() });
    }

    if (!cryptocurrency) {
      res.status(404).json({
        status: 'fail',
        message: `Cryptocurrency with ID or symbol '${id}' not found`,
      });
      return;
    }

    res.status(200).json({ status: 'success', data: { cryptocurrency } });
  } catch (error) {
    const msg = error instanceof Error ? error.message : 'Unknown error';
    res.status(500).json({ status: 'fail', message: msg });
  }
};

export const createCryptocurrency = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, symbol, current_price } = req.body;

    if (!name || !symbol || current_price === undefined) {
      res.status(400).json({ status: 'fail', message: 'Missing required fields' });
      return;
    }

    const existingCrypto = await Cryptocurrency.findOne({ symbol: symbol.toUpperCase() });
    if (existingCrypto) {
      res.status(409).json({ status: 'fail', message: 'Cryptocurrency symbol already exists' });
      return;
    }

    const cryptocurrency = await Cryptocurrency.create({
      name,
      symbol: symbol.toUpperCase(),
      current_price,
    });

    res.status(201).json({ status: 'success', data: { cryptocurrency } });
  } catch (error) {
    console.error('Error creating cryptocurrency:', error);
    const msg = error instanceof Error ? error.message : 'Unknown error';
    res.status(500).json({ status: 'fail', message: msg });
  }
};

export const createCryptocurrencyMany = async (req: Request, res: Response): Promise<void> => {
  try {
    const cryptocurrenciesData: Array<{ name: string; symbol: string; current_price: number }> =
      req.body;

    if (!Array.isArray(cryptocurrenciesData) || cryptocurrenciesData.length === 0) {
      res.status(400).json({ status: 'fail', message: 'Invalid data format' });
      return;
    }

    const existingSymbols = await Cryptocurrency.find({
      symbol: { $in: cryptocurrenciesData.map((c) => c.symbol.toUpperCase()) },
    });

    if (existingSymbols.length > 0) {
      res.status(409).json({
        status: 'fail',
        message: 'Some cryptocurrency symbols already exist',
        duplicates: existingSymbols.map((c) => c.symbol),
      });
      return;
    }

    const cryptocurrencies = await Cryptocurrency.insertMany(
      cryptocurrenciesData.map((c) => ({
        name: c.name,
        symbol: c.symbol.toUpperCase(),
        current_price: c.current_price,
      }))
    );

    res.status(201).json({ status: 'success', data: { cryptocurrencies } });
  } catch (error) {
    console.error('Error creating multiple cryptocurrencies:', error);
    const msg = error instanceof Error ? error.message : 'Unknown error';
    res.status(500).json({ status: 'fail', message: msg });
  }
};

export const deleteCryptocurrency = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const cryptocurrency = await Cryptocurrency.findByIdAndDelete(id);

    if (!cryptocurrency) {
      res.status(404).json({ status: 'fail', message: 'Cryptocurrency ID not found' });
      return;
    }

    res.status(200).json({ status: 'success', message: 'Cryptocurrency deleted' });
  } catch (error) {
    const msg = error instanceof Error ? error.message : 'Unknown error';
    res.status(500).json({ status: 'fail', message: msg });
  }
};

export const deleteCryptocurrenciesMany = async (req: Request, res: Response): Promise<void> => {
  try {
    const { symbols } = req.body as { symbols?: string[] };

    if (symbols && Array.isArray(symbols) && symbols.length > 0) {
      const deleteResult = await Cryptocurrency.deleteMany({
        symbol: { $in: symbols.map((s) => s.toUpperCase()) },
      });

      if (deleteResult.deletedCount === 0) {
        res.status(404).json({ status: 'fail', message: 'No matching cryptocurrencies found' });
        return;
      }

      res.status(200).json({ status: 'success', message: 'Selected cryptocurrencies deleted' });
      return;
    }

    await Cryptocurrency.deleteMany();
    res.status(200).json({ status: 'success', message: 'All cryptocurrencies deleted' });
  } catch (error) {
    const msg = error instanceof Error ? error.message : 'Unknown error';
    res.status(500).json({ status: 'fail', message: msg });
  }
};
