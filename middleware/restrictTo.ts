import { Request, Response, NextFunction } from 'express';

export const restrictTo = (...roles: string[]) =>
  (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user || !roles.includes(req.user.role)) {
      res.status(403).json({ status: 'fail', message: 'Access denied' });
      return;
    }
    next();
  };
