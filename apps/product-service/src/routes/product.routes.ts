import express, { Router } from 'express';
import { createDiscountCodes, getCategories, getDiscountCodes,deleteDiscountCode, uploadProductImage, deleteProductImage, createProduct, getShopProducts, restoreProduct, deleteProduct, getAllProducts } from '../controllers/product.controller';
import isAuthenticated from '@packages/middleware/isAuthenticated';
import { cleanupTempFiles, deleteFile, deleteFromImageKit, getAllSellers, getFileDetails, getFileStats, getSellerFiles, getUserFiles, markFileAsRead, upload, uploadFile, uploadMultipleFiles, uploadToImageKit } from '../controllers/files.controller';

const router: Router = express.Router();

router.get("/get-categories",getCategories);
router.post("/create-discount-code",isAuthenticated,createDiscountCodes);
router.get("/get-discount-code",isAuthenticated,getDiscountCodes);
router.delete("/delete-discount-code/:id",isAuthenticated,deleteDiscountCode);
router.post("/upload-product-image",isAuthenticated,uploadProductImage)
router.delete("/delete-product-image",isAuthenticated,deleteProductImage)
router.post("/create-product",isAuthenticated,createProduct)
router.get("/get-shop-products", isAuthenticated, getShopProducts)
router.delete("/delete-product/:productId", isAuthenticated, deleteProduct);
router.put("/restore-product/:productId", isAuthenticated, restoreProduct);
router.get("/get-all-products", getAllProducts);
router.post('/upload', isAuthenticated, upload.single('file'), uploadFile);
router.post('/upload-multiple', isAuthenticated, upload.array('files', 10), uploadMultipleFiles); // max 10 files

// File retrieval
router.get('/user-files/:userId', isAuthenticated, getUserFiles);
router.get('/seller-files/:sellerId', isAuthenticated, getSellerFiles);

// File management
router.patch('/mark-read/:fileId', isAuthenticated, markFileAsRead);
router.delete('/delete-file/:fileId', isAuthenticated, deleteFile);
router.get('/file-details/:fileId', isAuthenticated, getFileDetails);

// Stats
router.get('/stats', isAuthenticated, getFileStats);

// Seller dropdown
router.get('/get-all-sellers', isAuthenticated, getAllSellers);

// Utility ImageKit operations
router.post('/upload-to-imagekit', isAuthenticated, uploadToImageKit);
router.delete('/delete-from-imagekit', isAuthenticated, deleteFromImageKit);

// Cleanup temp files (for cron or admin)
router.delete('/cleanup-temp-files', cleanupTempFiles);

export default router;
