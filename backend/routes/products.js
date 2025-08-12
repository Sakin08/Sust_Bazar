import express from 'express';
import multer from 'multer';
import { authenticate } from '../middleware/auth.js';
import {
  getAllProducts,
  getProductById,
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

// Place '/my-products' BEFORE '/:id'
router.get('/', getAllProducts);
router.get('/my-products', authenticate, getMyProducts);
router.get('/:id', getProductById);

router.post('/', authenticate, upload.array('images', 5), createProduct);
router.put('/:id', authenticate, upload.array('images', 5), updateProduct);
router.delete('/:id', authenticate, deleteProduct);

export default router;
