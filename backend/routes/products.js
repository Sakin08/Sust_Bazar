import express from 'express';
import path from 'path';
import multer from 'multer';
import { authenticate } from '../middleware/auth.js';
import {
  getAllProducts,
  getProductById,     // use this instead of getProduct
  createProduct,
  updateProduct,
  deleteProduct,
  getUserProducts,
  getMyProducts,
} from '../controllers/productController.js';
import { memoryStorage, fileFilter } from '../middleware/multer.js';

const router = express.Router();

const upload = multer({
  storage: memoryStorage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter,
});

router.get('/', getAllProducts);
router.get('/my-products', authenticate, getUserProducts);
router.get('/:id', getProductById);  // <-- updated here
router.post('/', authenticate, upload.array('images', 5), createProduct);
router.put('/:id', authenticate, upload.array('images', 5), updateProduct);
router.delete('/:id', authenticate, deleteProduct);
router.get('/my', authenticate, getMyProducts);
export default router;
