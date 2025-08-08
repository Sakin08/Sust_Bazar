import express from 'express';
import multer from 'multer';
import path from 'path';
import { authenticate} from '../middleware/auth.js';
import {
  getAllProducts,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct,
  getUserProducts,
} from '../controllers/productController.js';

const router = express.Router();

// Use memory storage for multer to get file buffers
const storage = multer.memoryStorage();

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  },
});

router.get('/', getAllProducts);
router.get('/my-products', authenticate, getUserProducts);
router.get('/:id', getProduct);
router.post('/', authenticate, upload.array('images', 5), createProduct);
router.put('/:id', authenticate, upload.array('images', 5), updateProduct);
router.delete('/:id', authenticate, deleteProduct);

export default router;