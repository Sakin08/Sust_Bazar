import express from 'express';
import { authenticate, adminOnly } from '../middleware/auth.js';
import {
  getAllUsers,
  getAllProducts,
  banUser,
  deleteProduct,
  getStats
} from '../controllers/adminController.js';

const router = express.Router();

router.use(authenticate, adminOnly);

router.get('/users', getAllUsers);
router.get('/products', getAllProducts);
router.get('/stats', getStats);
router.put('/users/:userId/ban', banUser);
router.delete('/products/:productId', deleteProduct);

export default router;