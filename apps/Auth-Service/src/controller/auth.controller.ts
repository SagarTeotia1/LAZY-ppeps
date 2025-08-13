import { NextFunction, Request, Response } from 'express';
import {
  checkOtpRestriction,
  handleforgotpassword,
  sendotp,
  trackOtpRequest,
  validateRegistrationData,
  verifyOtp,
  verifyforgotpasswordotp,
} from '../utils/auth.helper';
import { AuthError, ValidationError } from '@packages/error-handler/Index';
import prisma from '@packages/libs/prisma';
import bcrypt from 'bcryptjs';
import jwt, { JsonWebTokenError } from 'jsonwebtoken';
import { setCookie } from '../utils/cookies/setcookies';
import { emitWarning } from 'process';
import Stripe from 'stripe';



const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
  apiVersion: '2025-06-30.basil',
});



export const userRegistration = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    validateRegistrationData(req.body, 'user');
    const { name, email } = req.body;
    const existinguser = await prisma.user.findUnique({ where: { email } });

    if (existinguser) {
      return next(new ValidationError('User already exist with this email!'));
    }

    await checkOtpRestriction(email, next);

    await trackOtpRequest(email, next);

    await sendotp(name, email, 'user-activation-mail');

    res.status(200).json({
      message: 'OTP sent to mail .please Verify your account.',
    });
  } catch (error) {
    return next(error);
  }
};


export const verifyUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { email, otp, password, name } = req.body;

    if (!email || !otp || !password || !name) {
      return next(new ValidationError('All Fields are required'));
    }
    const existinguser = await prisma.user.findUnique({ where: { email } });

    if (existinguser) {
      return next(new ValidationError('User already exists with this email!'));
    }

    await verifyOtp(email, otp, next);
    const hashedPassword = await bcrypt.hash(password, 10);

    await prisma.user.create({
      data: { name, email, password: hashedPassword },
    });

    res.status(201).json({
      success: true,
      message: 'User Registered Successfully!',
    });
  } catch (error) {
    return next(error);
  }
};


export const loginUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return next(new ValidationError('Emai and password are Required'));
    }

    const user = await prisma.user.findUnique({ where: { email } });

    if (!user) return next(new AuthError("User dosn't Exist"));

    const isMatch = await bcrypt.compare(password, user.password!);
    if (!isMatch) {
      return next(new AuthError('Invalid email or password'));
    }

    res.clearCookie('seller-access_Token');
    res.clearCookie('seller-refresh_Token');

    const accessToken = jwt.sign(
      { id: user.id, role: 'user' },
      process.env.ACCESS_TOKEN_SECRET as string,
      {
        expiresIn: '15m',
      }
    );

    const refreshToken = jwt.sign(
      { id: user.id, role: 'user' },
      process.env.REFRESH_TOKEN_SECRET as string,
      {
        expiresIn: '7d',
      }
    );

    setCookie(res, 'refresh_Token', refreshToken);
    setCookie(res, 'access_Token', accessToken);

    res.status(200).json({
      message: 'Login Success',
      user: { id: user.id, email: user.email, name: user.name },
    });
  } catch (error) {
    return next(error);
  }
};


export const refreshToken = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  try {
    const refreshToken =
      req.cookies['refresh_Token'] ||
      req.cookies['seller-refresh_Token'] ||
      req.headers.authorization?.split(' ')[1];

    if (!refreshToken) {
      return new ValidationError('Unauthorized! No refresh token.');
    }

    const decoded = jwt.verify(
      refreshToken,
      process.env.REFRESH_TOKEN_SECRET as string
    ) as { id: string; role: string };

    if (!decoded || !decoded.id || !decoded.role) {
      return new JsonWebTokenError('Forbidden! Inavalid refresh token.');
    }

    let account;

    if (decoded.role === 'user') {
      account = await prisma.user.findUnique({
        where: { id: decoded.id },
      });
    } else if (decoded.role === 'seller') {
      account = await prisma.sellers.findUnique({
        where: { id: decoded.id },
        include: { shop: true },
      });
    }

    if (!account) {
      return new AuthError('Forbidden! User/Seller not foound');
    }

    const newAcessToken = jwt.sign(
      { id: decoded.id, role: decoded.role },
      process.env.ACCESS_TOKEN_SECRET as string,
      { expiresIn: '15m' }
    );

    if (decoded.role == 'user') {
      setCookie(res, 'access_Token', newAcessToken);
    } else if (decoded.role == 'seller') {
      setCookie(res, 'seller-access_Token', newAcessToken);
    }
    req.role = decoded.role;

    return res.status(201).json({ success: true });
  } catch (error) {
    return next(error);
  }
};


export const getUser = async (req: any, res: Response, next: NextFunction) => {
  try {
    const user = req.user;
    res.status(201).json({
      success: true,
      user,
    });
  } catch (error) {
    next(error);
  }
};


export const userforgotpassword = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  await handleforgotpassword(req, res, next, 'user');
};


export const verifyUserforgotpassword = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  await verifyforgotpasswordotp(req, res, next);
};


export const resetUserpassword = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { email, newPassword } = req.body;

    if (!email || !newPassword)
      return next(new ValidationError('Email and new password are required!'));

    const user = await prisma.user.findUnique({ where: { email } });

    if (!user) return next(new ValidationError('User not Found'));

    const issamepassword = await bcrypt.compare(newPassword, user.password!);

    if (issamepassword) {
      return next(
        new ValidationError(
          'New password cannot be the same as the old password!'
        )
      );
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await prisma.user.update({
      where: { email },
      data: { password: hashedPassword },
    });

    res.status(200).json({
      Message: 'Password reset Successfully!',
    });
  } catch (error) {
    next(error);
  }
};


export const registerSeller = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    validateRegistrationData(req.body, 'seller');
    const { name, email } = req.body;

    const existingseller = await prisma.sellers.findUnique({
      where: { email },
    });
    if (existingseller) {
      throw new ValidationError('Seller already exists with this email!');
    }

    await checkOtpRestriction(email, name);
    await trackOtpRequest(email, name);
    await sendotp(name, email, 'seller-activation');
    res.status(200).json({ message: 'OTP sent to email Verify Your Account!' });
  } catch (error) {
    next(error);
  }
};


export const verifySeller = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { email, otp, password, name, phone_number, country } = req.body;
    if (!email || !otp || !password || !name || !phone_number || !country) {
      return next(new ValidationError('All fields are required!'));
    }
    const existingSeller = await prisma.sellers.findUnique({
      where: { email },
    });
    if (existingSeller)
      return next(
        new ValidationError('Seller already exists with this email!')
      );

    await verifyOtp(email, otp, next);
    const hashedPassword = await bcrypt.hash(password, 10);

    const seller = await prisma.sellers.create({
      data: {
        name,
        email,
        password: hashedPassword,
        country,
        phone_number,
      },
    });

    res
      .status(201)
      .json({ seller, message: 'Seller registered successfully! ' });
  } catch (error) {
    next(error);
  }
};


export const createShop = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { name, bio, address, opening_hours, website, category, sellerId } =
      req.body;

    if (
      !name ||
      !bio ||
      !address ||
      !opening_hours ||
      !website ||
      !category ||
      !sellerId
    ) {
      return next(new ValidationError('All fields Required!'));
    }
    const shopData: any = {
      name,
      bio,
      address,
      opening_hours,
      website,
      category,
      sellerId,
    };

    if (website && website.trim() !== '') {
      shopData.website = website;
    }

    const shop = await prisma.shops.create({
      data: shopData,
    });

    res.status(201).json({
      success: true,
      shop,
    });
  } catch (error) {
    next(error);
  }
};


export const createStripeConnectLink = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { sellerId } = req.body;

    if (!sellerId) {
      return next(new ValidationError('Seller Id is required'));
    }

    const seller = await prisma.sellers.findUnique({
      where: { id: sellerId },
    });

    if (!seller) {
      return next(new ValidationError('Seller is not available'));
    }

    const account = await stripe.accounts.create({
      type: 'express',
      email: seller.email,
      country: 'US',
      capabilities: {
        card_payments: { requested: true },
        transfers: { requested: true },
      },
    });

    await prisma.sellers.update({
      where: {
        id: sellerId,
      },
      data: {
        stripeId: account.id,
      },
    });

    const accountLink = await stripe.accountLinks.create({
      account: account.id,
      refresh_url: `http://localhost:3000/success`,
      return_url: `http://localhost:3000/success`,
      type: 'account_onboarding',
    });

    res.status(200).json({
      success: true,
      url: accountLink.url,
    });
  } catch (error) {
    next(error);
  }
};


export const loginSeller = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return next(new ValidationError('Email and password are required!'));
    }

    const seller = await prisma.sellers.findUnique({ where: { email } });
    if (!seller) {
      return next(new ValidationError('Invalid email or password!'));
    }

    const isMatch = await bcrypt.compare(password, seller.password!);
    if (!isMatch) {
      return next(new ValidationError('Invalid email or password!'));
    }

    res.clearCookie('access_Token');
    res.clearCookie('refresh_Token');

    // Generate tokens
    const accessToken = jwt.sign(
      { id: seller.id, role: 'seller' },
      process.env.ACCESS_TOKEN_SECRET as string,
      { expiresIn: '15m' }
    );

    const refreshToken = jwt.sign(
      { id: seller.id, role: 'seller' },
      process.env.REFRESH_TOKEN_SECRET as string,
      { expiresIn: '7d' }
    );
    setCookie(res, 'seller-refresh-token', refreshToken);
    setCookie(res, 'seller-access_Token', accessToken);

    res.status(200).json({
      message: 'Seller logged in successfully',
      seller: { id: seller.id, email: seller.email, name: seller.name },
    });
  } catch (error) {
    next(error);
  }
};


export const getSeller = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  try {
    const seller = req.seller;
    res.status(200).json({
      success: true,
      seller,
    });
  } catch (error) {
    next(error);
  }
};
