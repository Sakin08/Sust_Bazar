import express from 'express';
import { body } from 'express-validator';
import { 
  register, 
  login, 
  getProfile, 
  updateUserProfile, 
  getUserProfile,
  getAllUsers,
  toggleUserBan
} from '../controllers/userController.js';
import { authenticate } from '../middleware/auth.js';
import multer from 'multer';

// Setup multer for profile image upload
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) cb(null, true);
    else cb(new Error('Only image files are allowed!'), false);
  },
});

const router = express.Router();

// Validation for register & login
const registerValidation = [
  body('name').trim().isLength({ min: 2, max: 50 }).withMessage('Name must be 2-50 characters'),
  body('email')
    .isEmail()
    .withMessage('Please provide a valid email')
    .custom(value => {
      if (!value.endsWith('@student.sust.edu')) {
        throw new Error('Only SUST student emails are allowed');
      }
      return true;
    }),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('phone').trim().isLength({ min: 10 }).withMessage('Phone number must be at least 10 digits'),
  body('department').trim().notEmpty().withMessage('Department is required'),
  body('season').trim().notEmpty().withMessage('Season is required'),
  body('address').optional().trim(),
];

const loginValidation = [
  body('email').isEmail().withMessage('Please provide a valid email'),
  body('password').notEmpty().withMessage('Password is required'),
];

// Public routes
router.post('/register', registerValidation, register);
router.post('/login', loginValidation, login);

// Protected user routes
router.get('/profile', authenticate, getProfile);
router.put('/update-profile', authenticate, upload.single("image"), updateUserProfile);

// Admin routes
router.get('/all', authenticate, getAllUsers); // Changed from "/" to "/all"
router.patch('/:id/ban', authenticate, toggleUserBan);

// Get user profile by ID (this should be LAST to avoid conflicts)
router.get('/:id', authenticate, getUserProfile);

export default router;