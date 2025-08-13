import { AuthError } from '@packages/error-handler/Index';
import { NextFunction, Request, Response } from 'express';

export const isSeller = (req: any, res: Response, next: NextFunction) => {
  if (req.role !== 'seller') {
    return next(new AuthError('Access denied: Seller only'));
  }
  next();
};

export const isUser = (req: any, res: Response, next: NextFunction) => {
  if (req.role !== 'user') {
    return next(new AuthError('Access denied: User only'));
  }

  next();
};
