import express from 'express';
import { authenticate } from '../middleware/auth.js';
import {
  createAccommodation,
  getAccommodations,
  getAccommodationById,
  getMyAccommodations,
  bookAccommodation,
  updateBookingStatus,
} from '../controllers/accommodationController.js';
import { uploadMemory } from '../middleware/multer.js';

const router = express.Router();

// Place '/my-accommodations' BEFORE '/:id' to prevent route conflicts
router.post('/', authenticate, uploadMemory.array('images', 5), createAccommodation);
router.get('/', getAccommodations);
router.get('/my-accommodations', authenticate, getMyAccommodations);
router.get('/:id', getAccommodationById);

router.post('/:id/book', authenticate, bookAccommodation);
router.patch('/bookings/:bookingId', authenticate, updateBookingStatus);

export default router;
