import express from 'express';
import multer from 'multer';
import { getEvents, createEvent, deleteEvent } from '../controllers/eventController.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

// Configure file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename: (req, file, cb) => cb(null, Date.now() + '-' + file.originalname),
});
const upload = multer({ storage });

router.get('/', getEvents);
router.post('/', upload.single('media'), createEvent);
router.delete('/:id', authenticate, deleteEvent); 

export default router;
