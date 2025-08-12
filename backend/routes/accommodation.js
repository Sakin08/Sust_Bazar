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

router.post('/', authenticate, uploadMemory.array('images', 5), createAccommodation);
router.get('/', getAccommodations);

router.get('/:id', getAccommodationById);
// router.get('/my', authenticate, getMyAccommodations);  // <-- new endpoint
router.post('/:id/book', authenticate, bookAccommodation);
router.patch('/bookings/:bookingId', authenticate, updateBookingStatus);

export default router;
