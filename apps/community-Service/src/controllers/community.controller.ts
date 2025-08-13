import { NextFunction, Request, Response } from 'express';
import { imagekit } from '@packages/libs/imagekit';
import prisma from '@packages/libs/prisma';

export const uploadPostImage = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { fileName } = req.body;

    // Only users can create posts (not sellers)
    if (req.role !== 'user') {
      return res.status(403).json({
        success: false,
        message: 'Only users can upload post images',
      });
    }

    const userId = req.user!.id;

    const response = await imagekit.upload({
      file: fileName,
      fileName: `post-${userId}-${Date.now()}.jpg`,
      folder: '/post',
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

export const deletePostImage = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { fileId } = req.body;

    // Only users can delete post images
    if (req.role !== 'user') {
      return res.status(403).json({
        success: false,
        message: 'Only users can delete post images',
      });
    }

    // Optional: Verify the image belongs to the authenticated user
    const image = await prisma.images.findFirst({
      where: { 
        file_id: fileId,
        user_id: req.user!.id
      },
    });

    if (!image) {
      return res.status(404).json({
        success: false,
        message: 'Image not found or you do not have permission to delete it.',
      });
    }

    const response = await imagekit.deleteFile(fileId);

    res.status(200).json({
      success: true,
      response,
    });
  } catch (error) {
    next(error);
  }
};

export const createPost = async (
  req: Request, 
  res: Response, 
  next: NextFunction
) => {
  try {
    const { title, content, images } = req.body;
    
    // Only users can create posts
    if (req.role !== 'user') {
      return res.status(403).json({
        success: false,
        message: 'Only users can create posts',
      });
    }

    const userId = req.user!.id;

    // Validate required fields
    if (!title || !content) {
      return res.status(400).json({
        success: false,
        message: 'Title and content are required',
      });
    }

    if (!images || images.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'At least one image is required',
      });
    }

    const post = await prisma.post.create({
      data: {
        title,
        content,
        userId,
        images: {
          create: images.map((img: { file_id: string; url: string }) => ({
            file_id: img.file_id,
            url: img.url,
            user_id: userId,
          })),
        },
      },
      include: { 
        images: true,
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    res.status(201).json({ 
      success: true, 
      data: post,
      message: 'Post created successfully'
    });
  } catch (error) {
    console.error('Create post error:', error);
    next(error);
  }
};

// Get all posts
export const getAllPosts = async (
  _req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const posts = await prisma.post.findMany({
      orderBy: {
        id: 'desc', // Use 'id' instead of 'createdAt' if timestamps don't exist
      },
      include: {
        images: true,
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    res.status(200).json({
      success: true,
      data: posts,
    });
  } catch (error) {
    next(error);
  }
};

// Get posts for the authenticated user
export const getMyPosts = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // Only users can have posts
    if (req.role !== 'user') {
      return res.status(403).json({
        success: false,
        message: 'Only users can have posts',
      });
    }

    const userId = req.user!.id;

    const posts = await prisma.post.findMany({
      where: { userId },
      orderBy: {
        id: 'desc', // Use 'id' instead of 'createdAt' if timestamps don't exist
      },
      include: {
        images: true,
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    res.status(200).json({
      success: true,
      data: posts,
    });
  } catch (error) {
    next(error);
  }
};

// Get posts for a specific user (public endpoint)
export const getUserPosts = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { userId } = req.params;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: 'User ID is required',
      });
    }

    const posts = await prisma.post.findMany({
      where: { userId },
      orderBy: {
        id: 'desc', // Use 'id' instead of 'createdAt' if timestamps don't exist
      },
      include: {
        images: true,
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    res.status(200).json({
      success: true,
      data: posts,
    });
  } catch (error) {
    next(error);
  }
};

// Delete a post by ID (only by the post owner)
export const deletePost = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { postId } = req.params;

    // Only users can delete posts
    if (req.role !== 'user') {
      return res.status(403).json({
        success: false,
        message: 'Only users can delete posts',
      });
    }

    const userId = req.user!.id;

    if (!postId) {
      return res.status(400).json({
        success: false,
        message: 'Post ID is required',
      });
    }

    // Get the post and verify ownership
    const post = await prisma.post.findUnique({
      where: { id: postId },
      include: {
        images: true,
      },
    });

    if (!post) {
      return res.status(404).json({ 
        success: false, 
        message: 'Post not found' 
      });
    }

    // Check if the authenticated user owns this post
    if (post.userId !== userId) {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to delete this post',
      });
    }

    // Delete images from ImageKit
    for (const img of post.images) {
      try {
        await imagekit.deleteFile(img.file_id);
      } catch (error) {
        console.error('Failed to delete image from ImageKit:', error);
        // Continue with deletion even if ImageKit deletion fails
      }
    }

    // Delete the post and its related images
    await prisma.post.delete({
      where: { id: postId },
    });

    res.status(200).json({
      success: true,
      message: 'Post deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};