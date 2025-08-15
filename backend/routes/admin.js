import express from 'express';
import { authenticate, adminOnly } from '../middleware/auth.js';
import {
  getAllUsers,
  getAllProducts,
  banUser,
  deleteProduct,
  getStats,
  getAllAccommodations,
  deleteAccommodation
} from '../controllers/adminController.js';

const router = express.Router();

router.use(authenticate, adminOnly);

router.get('/users', getAllUsers);
router.get('/products', getAllProducts);
router.get('/accommodations', getAllAccommodations); // new route
router.get('/stats', getStats);

router.put('/users/:userId/ban', banUser);
router.delete('/products/:productId', deleteProduct);
router.delete('/accommodations/:accommodationId', deleteAccommodation); // new route

export default router;
