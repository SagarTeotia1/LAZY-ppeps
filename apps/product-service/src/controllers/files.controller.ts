import { Request, Response, NextFunction } from 'express';
import prisma from '@packages/libs/prisma';
import multer from 'multer';
import path from 'path';
import fs from 'fs/promises';
import { v4 as uuidv4 } from 'uuid';

import {
  AuthError,
  NotFoundError,
  ValidationError,
  InternalServerError,
} from '@packages/error-handler/Index';

import { imagekit } from '@packages/libs/imagekit';
import { Prisma } from '@prisma/client';

// Ensure upload directory exists
const uploadDir = path.join(process.cwd(), 'uploads', 'temp');

// Create upload directory if it doesn't exist
const ensureUploadDir = async () => {
  try {
    await fs.access(uploadDir);
  } catch {
    await fs.mkdir(uploadDir, { recursive: true });
  }
};

// Initialize upload directory
ensureUploadDir();

// Utility function to handle unknown errors
const toError = (error: unknown): Error => {
  if (error instanceof Error) return error;
  if (typeof error === 'string') return new Error(error);
  return new Error('Unknown error occurred');
};

// Configure disk storage
const storage = multer.diskStorage({
  destination: async (req, file, cb) => {
    try {
      await ensureUploadDir();
      cb(null, uploadDir);
    } catch (error) {
      cb(toError(error), uploadDir);
    }
  },
  filename: (req, file, cb) => {
    // Generate unique filename with original extension
    const uniqueName = `${uuidv4()}-${Date.now()}${path.extname(file.originalname)}`;
    cb(null, uniqueName);
  }
});

// Enhanced file filter with proper typing
const fileFilter = (req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  const allowedMimeTypes = [
    'application/pdf',
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/webp',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'text/plain'
  ];

  const allowedExtensions = ['.pdf', '.jpg', '.jpeg', '.png', '.webp', '.doc', '.docx', '.txt'];
  const fileExtension = path.extname(file.originalname).toLowerCase();

  if (allowedMimeTypes.includes(file.mimetype) && allowedExtensions.includes(fileExtension)) {
    cb(null, true);
  } else {
    cb(new ValidationError('File type not allowed. Allowed types: PDF, JPG, PNG, WEBP, DOC, DOCX, TXT'));
  }
};

export const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 25 * 1024 * 1024, // 25MB limit
    files: 5 // Maximum 5 files at once
  }
});

// Utility function to clean up temporary files
const cleanupTempFile = async (filePath: string) => {
  try {
    await fs.unlink(filePath);
  } catch (error) {
    console.error('Error cleaning up temp file:', error);
  }
};

// Upload single file to ImageKit and create record
export const uploadFile = async (req: Request, res: Response, next: NextFunction) => {
  let tempFilePath: string | null = null;
  
  try {
    const { sellerId, message, userId } = req.body;
    const file = req.file;

    if (!file) {
      return next(new ValidationError('No file uploaded'));
    }

    tempFilePath = file.path;

    if (!sellerId || !userId) {
      await cleanupTempFile(tempFilePath);
      return next(new ValidationError('Seller ID and User ID are required'));
    }

    // Verify seller exists and is active
    const seller = await prisma.sellers.findUnique({
      where: { id: sellerId },
      select: { id: true, name: true, email: true, isActive: true }
    });

    if (!seller) {
      await cleanupTempFile(tempFilePath);
      return next(new NotFoundError('Seller not found'));
    }

    if (seller.isActive === false) {
      await cleanupTempFile(tempFilePath);
      return next(new ValidationError('Seller is not active'));
    }

    // Verify user exists and is active
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, name: true, email: true, isActive: true }
    });

    if (!user) {
      await cleanupTempFile(tempFilePath);
      return next(new NotFoundError('User not found'));
    }

    if (user.isActive === false) {
      await cleanupTempFile(tempFilePath);
      return next(new ValidationError('User account is not active'));
    }

    // Read file from disk for ImageKit upload
    const fileBuffer = await fs.readFile(tempFilePath);

    // Upload file to ImageKit
    const response = await imagekit.upload({
      file: fileBuffer,
      fileName: `file-${Date.now()}-${file.originalname}`,
      folder: '/user-files',
      tags: ['user-upload', `user-${userId}`, `seller-${sellerId}`],
      useUniqueFileName: true,
    });

    // Create file record in database
    const fileRecord = await prisma.files.create({
      data: {
        filename: response.name,
        originalName: file.originalname,
        mimeType: file.mimetype,
        size: file.size,
        url: response.url,
        file_id: response.fileId,
        userId,
        sellerId,
        message: message?.trim() || null,
        status: 'Sent',
        sentAt: new Date(),
        fileHash: response.fileId,
      },
      include: {
        user: {
          select: { id: true, name: true, email: true }
        },
        seller: {
          select: { id: true, name: true, email: true }
        }
      }
    });

    // Clean up temporary file
    await cleanupTempFile(tempFilePath);

    res.status(201).json({
      success: true,
      message: 'File uploaded and sent successfully',
      data: {
        ...fileRecord,
        downloadUrl: response.url,
        thumbnailUrl: response.thumbnailUrl || null,
      }
    });

  } catch (error) {
    // Clean up temporary file in case of error
    if (tempFilePath) {
      await cleanupTempFile(tempFilePath);
    }
    
    console.error('File upload error:', error);
    next(error);
  }
};

// Upload multiple files at once
export const uploadMultipleFiles = async (req: Request, res: Response, next: NextFunction) => {
  const tempFilePaths: string[] = [];
  
  try {
    const { sellerId, message, userId } = req.body;
    const files = req.files as Express.Multer.File[];

    if (!files || files.length === 0) {
      return next(new ValidationError('No files uploaded'));
    }

    tempFilePaths.push(...files.map(file => file.path));

    if (!sellerId || !userId) {
      await Promise.all(tempFilePaths.map(cleanupTempFile));
      return next(new ValidationError('Seller ID and User ID are required'));
    }

    // Verify seller and user exist and are active
    const [seller, user] = await Promise.all([
      prisma.sellers.findUnique({
        where: { id: sellerId },
        select: { id: true, name: true, email: true, isActive: true }
      }),
      prisma.user.findUnique({
        where: { id: userId },
        select: { id: true, name: true, email: true, isActive: true }
      })
    ]);

    if (!seller || !user) {
      await Promise.all(tempFilePaths.map(cleanupTempFile));
      return next(new NotFoundError('Seller or User not found'));
    }

    if (seller.isActive === false || user.isActive === false) {
      await Promise.all(tempFilePaths.map(cleanupTempFile));
      return next(new ValidationError('Seller or User account is not active'));
    }

    // Upload all files to ImageKit
    const uploadPromises = files.map(async (file) => {
      const fileBuffer = await fs.readFile(file.path);
      return imagekit.upload({
        file: fileBuffer,
        fileName: `file-${Date.now()}-${file.originalname}`,
        folder: '/user-files',
        tags: ['user-upload', `user-${userId}`, `seller-${sellerId}`],
        useUniqueFileName: true,
      });
    });

    const uploadResponses = await Promise.all(uploadPromises);

    // Create file records in database
    const fileRecords = await prisma.$transaction(async (prisma) => {
      const createPromises = files.map((file, index) => {
        const response = uploadResponses[index];
        return prisma.files.create({
          data: {
            filename: response.name,
            originalName: file.originalname,
            mimeType: file.mimetype,
            size: file.size,
            url: response.url,
            file_id: response.fileId,
            userId,
            sellerId,
            message: message?.trim() || null,
            status: 'Sent',
            sentAt: new Date(),
            fileHash: response.fileId,
          },
          include: {
            user: {
              select: { id: true, name: true, email: true }
            },
            seller: {
              select: { id: true, name: true, email: true }
            }
          }
        });
      });

      return Promise.all(createPromises);
    });

    // Clean up temporary files
    await Promise.all(tempFilePaths.map(cleanupTempFile));

    res.status(201).json({
      success: true,
      message: `${files.length} files uploaded and sent successfully`,
      data: fileRecords.map((record, index) => ({
        ...record,
        downloadUrl: uploadResponses[index].url,
        thumbnailUrl: uploadResponses[index].thumbnailUrl || null,
      }))
    });

  } catch (error) {
    // Clean up temporary files in case of error
    await Promise.all(tempFilePaths.map(cleanupTempFile));
    
    console.error('Multiple files upload error:', error);
    next(error);
  }
};

// Get all files sent by a user with pagination
export const getUserFiles = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { userId } = req.params;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const status = req.query.status as string;
    const search = req.query.search as string;

    const skip = (page - 1) * limit;
    
    const where: Prisma.filesWhereInput = { userId };
    
    if (status && status !== 'all') {
      where.status = status as any;
    }
    
    if (search) {
      where.OR = [
        { originalName: { contains: search, mode: 'insensitive' } },
        { message: { contains: search, mode: 'insensitive' } },
        { seller: { name: { contains: search, mode: 'insensitive' } } }
      ];
    }

    const [files, totalCount] = await Promise.all([
      prisma.files.findMany({
        where,
        include: {
          seller: {
            select: { 
              id: true, 
              name: true, 
              email: true,
              shop: {
                select: { name: true, category: true }
              }
            }
          }
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit
      }),
      prisma.files.count({ where })
    ]);

    const totalPages = Math.ceil(totalCount / limit);

    res.status(200).json({
      success: true,
      files,
      total: totalCount,
      currentPage: page,
      totalPages,
      hasNext: page < totalPages,
      hasPrev: page > 1
    });

  } catch (error) {
    console.error('Get user files error:', error);
    next(error);
  }
};

// Get all files received by a seller with pagination
export const getSellerFiles = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { sellerId } = req.params;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const status = req.query.status as string;
    const search = req.query.search as string;

    const skip = (page - 1) * limit;
    
    const where: Prisma.filesWhereInput = { sellerId };
    
    if (status && status !== 'all') {
      where.status = status as any;
    }
    
    if (search) {
      where.OR = [
        { originalName: { contains: search, mode: 'insensitive' } },
        { message: { contains: search, mode: 'insensitive' } },
        { user: { name: { contains: search, mode: 'insensitive' } } }
      ];
    }

    const [files, totalCount] = await Promise.all([
      prisma.files.findMany({
        where,
        include: {
          user: {
            select: { id: true, name: true, email: true }
          }
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit
      }),
      prisma.files.count({ where })
    ]);

    const totalPages = Math.ceil(totalCount / limit);

    res.status(200).json({
      success: true,
      files,
      total: totalCount,
      currentPage: page,
      totalPages,
      hasNext: page < totalPages,
      hasPrev: page > 1
    });

  } catch (error) {
    console.error('Get seller files error:', error);
    next(error);
  }
};

// Mark file as read by seller
export const markFileAsRead = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { fileId } = req.params;
    const { sellerId } = req.body;

    if (!sellerId) {
      return next(new ValidationError('Seller ID is required'));
    }

    const file = await prisma.files.findUnique({
      where: { id: fileId },
      include: {
        seller: { select: { id: true, name: true } },
        user: { select: { id: true, name: true } }
      }
    });

    if (!file) {
      return next(new NotFoundError('File not found'));
    }

    if (file.sellerId !== sellerId) {
      return next(new AuthError('Unauthorized to mark this file as read'));
    }

    if (file.status === 'Read') {
      return res.status(200).json({
        success: true,
        message: 'File already marked as read',
        data: file
      });
    }

    const updatedFile = await prisma.files.update({
      where: { id: fileId },
      data: {
        status: 'Read',
        readAt: new Date()
      },
      include: {
        seller: { select: { id: true, name: true } },
        user: { select: { id: true, name: true } }
      }
    });

    res.status(200).json({
      success: true,
      message: 'File marked as read',
      data: updatedFile
    });

  } catch (error) {
    console.error('Mark file as read error:', error);
    next(error);
  }
};

// Get all sellers for dropdown
export const getAllSellers = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const search = req.query.search as string;
    const isActive = req.query.isActive !== 'false'; // Default to true
    
    const where: Prisma.sellersWhereInput = { isActive };
    
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { shop: { name: { contains: search, mode: 'insensitive' } } }
      ];
    }

    const sellers = await prisma.sellers.findMany({
      where,
      select: {
        id: true,
        name: true,
        email: true,
        isActive: true,
        shop: {
          select: {
            name: true,
            category: true,
            isActive: true
          }
        }
      },
      orderBy: { name: 'asc' }
    });

    res.status(200).json({
      success: true,
      sellers
    });

  } catch (error) {
    console.error('Get sellers error:', error);
    next(error);
  }
};

// Delete file from ImageKit and database
export const deleteFile = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { fileId } = req.params;
    const { userId, sellerId } = req.body;

    if (!userId && !sellerId) {
      return next(new ValidationError('User ID or Seller ID is required'));
    }

    const file = await prisma.files.findUnique({
      where: { id: fileId },
      include: {
        user: { select: { id: true, name: true } },
        seller: { select: { id: true, name: true } }
      }
    });

    if (!file) {
      return next(new NotFoundError('File not found'));
    }

    // Check authorization
    const isAuthorized = (userId && file.userId === userId) || 
                        (sellerId && file.sellerId === sellerId);
    
    if (!isAuthorized) {
      return next(new AuthError('Unauthorized to delete this file'));
    }

    // Delete from ImageKit
    try {
      await imagekit.deleteFile(file.file_id);
    } catch (imagekitError) {
      console.error('ImageKit deletion error:', imagekitError);
      // Continue with database deletion even if ImageKit deletion fails
    }

    // Delete from database
    await prisma.files.delete({
      where: { id: fileId }
    });

    res.status(200).json({
      success: true,
      message: 'File deleted successfully'
    });

  } catch (error) {
    console.error('Delete file error:', error);
    next(error);
  }
};

// Get file details with access control
export const getFileDetails = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { fileId } = req.params;
    const userId = req.query.userId as string;
    const sellerId = req.query.sellerId as string;

    const file = await prisma.files.findUnique({
      where: { id: fileId },
      include: {
        user: {
          select: { id: true, name: true, email: true }
        },
        seller: {
          select: { 
            id: true, 
            name: true, 
            email: true,
            shop: {
              select: { name: true, category: true }
            }
          }
        }
      }
    });

    if (!file) {
      return next(new NotFoundError('File not found'));
    }

    // Check access permissions
    const hasAccess = (userId && file.userId === userId) || 
                     (sellerId && file.sellerId === sellerId);
    
    if (!hasAccess) {
      return next(new AuthError('Unauthorized to access this file'));
    }

    res.status(200).json({
      success: true,
      data: {
        ...file,
        downloadUrl: file.url,
        canDelete: hasAccess,
        canMarkAsRead: sellerId && file.sellerId === sellerId && file.status !== 'Read'
      }
    });

  } catch (error) {
    console.error('Get file details error:', error);
    next(error);
  }
};

// Get file statistics
export const getFileStats = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.query.userId as string;
    const sellerId = req.query.sellerId as string;
    const timeframe = (req.query.timeframe as string) || '30d';

    let dateFilter: Date;
    switch (timeframe) {
      case '7d':
        dateFilter = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
        break;
      case '30d':
        dateFilter = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
        break;
      case '90d':
        dateFilter = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000);
        break;
      default:
        dateFilter = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    }

    const baseWhere: Prisma.filesWhereInput = {
      createdAt: { gte: dateFilter }
    };

    if (userId) baseWhere.userId = userId;
    if (sellerId) baseWhere.sellerId = sellerId;

    const [totalFiles, sentFiles, readFiles, unreadFiles, totalSize] = await Promise.all([
      prisma.files.count({ where: baseWhere }),
      prisma.files.count({ where: { ...baseWhere, status: 'Sent' } }),
      prisma.files.count({ where: { ...baseWhere, status: 'Read' } }),
      prisma.files.count({ where: { ...baseWhere, status: 'Sent' } }),
      prisma.files.aggregate({
        where: baseWhere,
        _sum: { size: true }
      })
    ]);

    res.status(200).json({
      success: true,
      data: {
        totalFiles,
        sentFiles,
        readFiles,
        unreadFiles,
        totalSize: totalSize._sum.size || 0,
        timeframe
      }
    });

  } catch (error) {
    console.error('Get file stats error:', error);
    next(error);
  }
};

// Upload file directly to ImageKit (for product images, etc.)
export const uploadToImageKit = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { fileName, folder = '/uploads' } = req.body;

    if (!fileName) {
      return next(new ValidationError('File data is required'));
    }

    const response = await imagekit.upload({
      file: fileName,
      fileName: `file-${Date.now()}.jpg`,
      folder,
    });

    res.status(201).json({
      success: true,
      fileId: response.fileId,
      file_url: response.url,
      data: response,
    });
  } catch (error) {
    console.error('ImageKit upload error:', error);
    next(error);
  }
};

// Delete file from ImageKit only
export const deleteFromImageKit = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { fileId } = req.body;

    if (!fileId) {
      return next(new ValidationError('File ID is required'));
    }

    const response = await imagekit.deleteFile(fileId);

    res.status(200).json({
      success: true,
      message: 'File deleted from ImageKit successfully',
      response,
    });
  } catch (error) {
    console.error('ImageKit deletion error:', error);
    next(error);
  }
};

// Cleanup old temporary files (utility for cron jobs)
export const cleanupTempFiles = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const files = await fs.readdir(uploadDir);
    const now = Date.now();
    const oneHourAgo = now - (60 * 60 * 1000); // 1 hour ago

    let cleanedCount = 0;

    for (const file of files) {
      const filePath = path.join(uploadDir, file);
      const stats = await fs.stat(filePath);
      
      if (stats.mtime.getTime() < oneHourAgo) {
        await fs.unlink(filePath);
        cleanedCount++;
      }
    }

    res.status(200).json({
      success: true,
      message: `Cleaned up ${cleanedCount} temporary files`
    });

  } catch (error) {
    console.error('Cleanup temp files error:', error);
    next(error);
  }
};