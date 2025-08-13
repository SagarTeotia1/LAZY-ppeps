import express, { Router } from 'express';
import isAuthenticated from '@packages/middleware/isAuthenticated';
import {
  uploadPostImage,
  deletePostImage,
  createPost,
  getAllPosts,
  getUserPosts,
  deletePost,
} from '../controllers/community.controller';

const router: Router = express.Router();

router.post("/upload-post-image", isAuthenticated, uploadPostImage);
router.delete("/delete-post-image", isAuthenticated, deletePostImage);
router.post("/create-post", isAuthenticated, createPost);
router.get("/get-all-post", getAllPosts);
router.get("/get-user-post/:userId", isAuthenticated, getUserPosts);
router.delete("/delete-post/:postId", isAuthenticated, deletePost);

export default router;
