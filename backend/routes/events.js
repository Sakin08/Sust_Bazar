import express from 'express';
import multer from 'multer';
import { getEvents, createEvent } from '../controllers/eventController.js';

const router = express.Router();

// Configure file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename: (req, file, cb) => cb(null, Date.now() + '-' + file.originalname),
});
const upload = multer({ storage });

router.get('/', getEvents);
router.post('/', upload.single('media'), createEvent);

export default router;
