import { Request, Response, NextFunction } from 'express';
import prisma from '@packages/libs/prisma';

import multer from 'multer';

import {
  AuthError,
  NotFoundError,
  ValidationError,
} from '@packages/error-handler/Index';

import { imagekit } from '@packages/libs/imagekit';

import { Prisma } from '@prisma/client';


export const getCategories = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const config = await prisma.site_config.findFirst();

    if (!config) {
      return res.status(404).json({ message: 'Categories not found' });
    }

    return res.status(200).json({
      categories: config.categories,
      subcategories: config.subCategories,
    });
  } catch (error) {
    return next(error);
  }
};

export const createDiscountCodes = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  try {
    const { public_name, discountType, discountValue, discountCode } = req.body;

    const isDiscountCodeExist = await prisma.discount_codes.findUnique({
      where: {
        discountCode,
      },
    });

    if (isDiscountCodeExist) {
      return next(new ValidationError('Discount code already exists'));
    }

    const discount_code = await prisma.discount_codes.create({
      data: {
        public_name,
        discountType,
        discountValue: parseFloat(discountValue),
        discountCode,
        sellerId: req.seller.id,
      },
    });

    return res.status(201).json({
      success: true,
      discount_code,
    });
  } catch (error) {
    next(error);
  }
};

export const getDiscountCodes = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  try {
    const discount_codes = await prisma.discount_codes.findMany({
      where: {
        sellerId: req.seller.id,
      },
    });

    return res.status(200).json({
      success: true,
      discount_codes,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteDiscountCode = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const sellerId = req.seller?.id;

    const discountCode = await prisma.discount_codes.findUnique({
      where: { id },
      select: { id: true, sellerId: true },
    });

    if (!discountCode) {
      return next(new NotFoundError('Discount code not found'));
    }

    if (discountCode.sellerId !== sellerId) {
      return next(
        new ValidationError(
          'You are not authorized to delete this discount code.'
        )
      );
    }

    await prisma.discount_codes.delete({
      where: { id },
    });

    return res.status(200).json({
      success: true,
      message: 'Discount code deleted successfully.',
    });
  } catch (error) {
    next(error);
  }
};

export const uploadProductImage = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { fileName } = req.body;

    const response = await imagekit.upload({
      file: fileName,
      fileName: `product-${Date.now()}.jpg`,
      folder: '/products',
    });

    res.status(201).json({
      fileId: response.fileId,
      file_url: response.url,

      success: true,
      data: response,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteProductImage = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { fileId } = req.body;

    const response = await imagekit.deleteFile(fileId);

    res.status(201).json({
      success: true,
      response,
    });
  } catch (error) {
    next(error);
  }
};

export const createProduct = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  try {
    const {
      title,
      short_description,
      detailed_description,
      warranty,
      custom_specifications,
      slug,
      tags,
      cash_on_delivery,
      brand,
      video_url,
      category,
      colors = [],
      sizes = [],
      discountCodes,
      stock,
      sale_price,
      regular_price,
      subCategory,
      customProperties = {},
      images = [],
    } = req.body;
    if (
      !title ||
      !slug ||
      !short_description ||
      !category ||
      !subCategory ||
      !sale_price ||
      !images ||
      !tags ||
      !stock ||
      !regular_price ||
      !stock
    ) {
      return next(new ValidationError('Missin Required fields'));
    }
    if (!req.seller.id) {
      return next(new AuthError('Only seller can create products!'));
    }
    const slugChecking = await prisma.products.findUnique({
      where: {
        slug,
      },
    });

    if (slugChecking) {
      return next(
        new ValidationError('Slug already exists! Please use a different slug!')
      );
    }
    const newProduct = await prisma.products.create({
      data: {
        title,
        short_description,
        detailed_description,
        warranty,
        cashOnDelivery: cash_on_delivery,
        slug,
        shopId: req.seller?.shop?.id!,
        tags: Array.isArray(tags) ? tags : tags.split(','),
        brand,
        video_url,
        category,
        subCategory,
        colors: colors || [],
        discount_codes: discountCodes.map((codeId: String) => codeId),
        sizes: sizes || [],
        stock: parseInt(stock),
        sale_price: parseFloat(sale_price),
        regular_price: parseFloat(regular_price),
        custom_properties: customProperties || {},
        custom_specifications: custom_specifications || {},
        images: {
          create: images
            .filter((img: any) => img && img.fileId && img.file_url)
            .map((img: any) => ({
              file_id: img.fileId,
              url: img.file_url,
            })),
        },
      },
      include: { images: true },
    });

    res.status(201).json({
      success: true,
      newProduct,
    });
  } catch (error) {
    next(error);
  }
};

export const getShopProducts = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  try {
    const products = await prisma.products.findMany({
      where: {
        shopId: req?.seller?.shop?.id,
      },
      include: {
        images: true,
      },
    });

    return res.status(201).json({
      success: true,
      products,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteProduct = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  try {
    const { productId } = req.params;
    const sellerId = req.seller?.shop?.id;

    const product = await prisma.products.findUnique({
      where: { id: productId },
      select: { id: true, shopId: true, isDeleted: true },
    });

    if (!product) {
      return next(new ValidationError('Product not found'));
    }
    if (product.shopId !== sellerId) {
      return next(new ValidationError('Unauthorized action'));
    }

    if (product.isDeleted) {
      return next(new ValidationError('Product is already deleted'));
    }
    const deletedProduct = await prisma.products.update({
      where: { id: productId },
      data: {
        isDeleted: true,
        deletedAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
      },
    });

    return res.status(200).json({
      message:
        'Product is scheduled for deletion in 24 hours. You can restore it within this time.',
      deletedAt: deletedProduct.deletedAt,
    });
  } catch (error) {
    return next(error);
  }
};

export const restoreProduct = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  try {
    const { productId } = req.params;

    const sellerId = req.seller?.shop?.id;

    const product = await prisma.products.findUnique({
      where: { id: productId },
      select: { id: true, shopId: true, isDeleted: true },
    });

    if (!product) {
      return next(new ValidationError('Product not found'));
    }

    if (product.shopId !== sellerId) {
      return next(new ValidationError('Unauthorized action'));
    }

    if (!product.isDeleted) {
      return res
        .status(400)
        .json({ message: 'Product is not in deleted state' });
    }

    await prisma.products.update({
      where: { id: productId },
      data: { isDeleted: false, deletedAt: null },
    });

    return res.status(200).json({ message: 'Product successfully restored!' });
  } catch (error) {
    return res.status(500).json({ message: 'Error restoring product', error });
  }
};

export const getAllProducts = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // Handle both 'p' and 'page' parameters for backward compatibility
    const page = parseInt((req.query.page as string) || (req.query.p as string)) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const skip = (page - 1) * limit;
    const type = req.query.type;

    // Simplified base filter
    const baseFilter = {
      isDeleted: false,
      // Remove the totalSales filter if it's causing issues
      // totalSales: { gte: 0 },
    };

    const orderBy: Prisma.productsOrderByWithRelationInput =
      type === 'latest'
        ? { createdAt: 'desc' as Prisma.SortOrder }
        : { totalSales: 'desc' as Prisma.SortOrder };

    // Fetch products with pagination, filtering, and ordering
    const [products, total, top10Products] = await Promise.all([
      prisma.products.findMany({
        skip,
        take: limit,
        include: {
          images: true,
          Shop: true,
        },
        where: baseFilter,
        orderBy: {
          totalSales: 'desc',
        },
      }),

      prisma.products.count({ where: baseFilter }),

      prisma.products.findMany({
        take: 10,
        include: {
          images: true,
          Shop: true,
        },
        where: baseFilter,
        orderBy,
      }),
    ]);

    console.log('Products found:', products.length); // Add logging
    console.log('Total count:', total);
    console.log('Filter used:', baseFilter);

    res.status(200).json({
      products,
      top10By: type === 'latest' ? 'latest' : 'topSales',
      top10Products,
      total,
      currentPage: page,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    console.error('Error in getAllProducts:', error);
    next(error);
  }
};

