import prisma from '@packages/libs/prisma';
import { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';

// Utility function to validate MongoDB ObjectId
const isValidObjectId = (id: string): boolean => {
  return /^[0-9a-fA-F]{24}$/.test(id);
};

// Extend Request interface to include user, seller, and role
declare global {
  namespace Express {
    interface Request {
      user?: any;
      seller?: any;
      role?: 'user' | 'seller';
    }
  }
}

const isAuthenticated = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const token =
      req.cookies['access_Token'] ||
      req.cookies['seller-access_Token'] ||
      req.headers.authorization?.split(' ')[1];

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized: Token missing!',
      });
    }

    const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET!) as {
      id: string;
      role: 'user' | 'seller';
    };

    if (!decoded) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized: Invalid token.',
      });
    }

    if (!isValidObjectId(decoded.id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid ID format in token',
      });
    }

    let account = null;

    if (decoded.role === 'user') {
      account = await prisma.user.findUnique({
        where: { id: decoded.id },
        select: {
          id: true,
          name: true,
          email: true,
          isActive: true,
          createdAt: true,
          updatedAt: true,
        },
      });

      if (account && !account.isActive) {
        return res.status(401).json({
          success: false,
          message: 'User account is deactivated',
        });
      }

      req.user = account;
    } else if (decoded.role === 'seller') {
      account = await prisma.sellers.findUnique({
        where: { id: decoded.id },
        select: {
          id: true,
          name: true,
          email: true,
          isActive: true,
          createdAt: true,
          updatedAt: true,
          shop: {
            select: {
              id: true,
              name: true,
              bio: true,
              category: true,
              isActive: true,
            },
          },
        },
      });

      if (account && !account.isActive) {
        return res.status(401).json({
          success: false,
          message: 'Seller account is deactivated',
        });
      }

      req.seller = account;
    }

    if (!account) {
      return res.status(401).json({
        success: false,
        message: 'Account not found',
      });
    }

    req.role = decoded.role;

    return next();
  } catch (error: any) {
    console.error('Authentication error:', error);

    if (error instanceof jwt.JsonWebTokenError) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized: Invalid token.',
      });
    }

    if (error instanceof jwt.TokenExpiredError) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized: Token expired.',
      });
    }

    // Prisma error handling for invalid IDs
    if (error.code === 'P2023') {
      return res.status(400).json({
        success: false,
        message: 'Invalid ID format',
      });
    }

    return res.status(500).json({
      success: false,
      message: 'Internal server error during authentication',
    });
  }
};

export default isAuthenticated;
