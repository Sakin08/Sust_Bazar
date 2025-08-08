// routes/users.js
import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { User } from '../models/index.js';
import { authenticate } from '../middleware/auth.js'; // Changed from authenticateToken to authenticate

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = path.join(__dirname, '..', 'uploads', 'profiles');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'profile-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const fileFilter = (req, file, cb) => {
  // Check file type
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed!'), false);
  }
};

const upload = multer({ 
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  }
});

// GET /api/users/profile - Get user profile
router.get('/profile', authenticate, async (req, res) => { // Changed from authenticateToken
  try {
    const user = await User.findByPk(req.user.id, {
      attributes: { exclude: ['password'] }
    });
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    res.json({ user });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// PUT /api/users/profile - Update user profile
router.put('/profile', authenticate, async (req, res) => { // Changed from authenticateToken
  try {
    const { name, phone, department, season, bio, dateOfBirth, address } = req.body;
    
    // Validation
    if (!name || name.trim().length < 2) {
      return res.status(400).json({ message: 'Name must be at least 2 characters long' });
    }

    if (phone && !/^\+?[\d\s\-\(\)]+$/.test(phone)) {
      return res.status(400).json({ message: 'Invalid phone number format' });
    }

    if (dateOfBirth && new Date(dateOfBirth) > new Date()) {
      return res.status(400).json({ message: 'Date of birth cannot be in the future' });
    }

    // Find user
    const user = await User.findByPk(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Update user fields
    await user.update({
      name: name.trim(),
      phone: phone ? phone.trim() : user.phone,
      department: department ? department.trim() : user.department,
      season: season ? season.trim() : user.season,
      bio: bio ? bio.trim() : user.bio,
      date_of_birth: dateOfBirth || user.date_of_birth,
      address: address ? address.trim() : user.address,
      updated_at: new Date()
    });

    // Return updated user without password
    const updatedUser = await User.findByPk(user.id, {
      attributes: { exclude: ['password'] }
    });
    
    res.json({ 
      message: 'Profile updated successfully',
      user: updatedUser 
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// POST /api/users/upload-profile-image - Upload profile image
router.post('/upload-profile-image', authenticate, upload.single('profileImage'), async (req, res) => { // Changed from authenticateToken
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No image file provided' });
    }

    const user = await User.findByPk(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Delete old profile image if exists
    if (user.profile_image) {
      const oldImagePath = user.profile_image.replace(`${req.protocol}://${req.get('host')}/`, '');
      const fullOldPath = path.join(__dirname, '..', oldImagePath);
      if (fs.existsSync(fullOldPath)) {
        fs.unlinkSync(fullOldPath);
      }
    }

    // Create image URL relative to uploads directory
    const relativePath = path.relative(path.join(__dirname, '..'), req.file.path);
    const imageUrl = `${req.protocol}://${req.get('host')}/${relativePath.replace(/\\/g, '/')}`;
    
    // Update user with new image URL
    await user.update({
      profile_image: imageUrl,
      updated_at: new Date()
    });

    res.json({ 
      message: 'Profile image uploaded successfully',
      imageUrl: imageUrl
    });
  } catch (error) {
    console.error('Upload image error:', error);
    
    // Delete uploaded file if there was an error
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    
    res.status(500).json({ message: 'Failed to upload image' });
  }
});

// DELETE /api/users/profile-image - Delete profile image
router.delete('/profile-image', authenticate, async (req, res) => { // Changed from authenticateToken
  try {
    const user = await User.findByPk(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Delete image file if exists
    if (user.profile_image) {
      const imagePath = user.profile_image.replace(`${req.protocol}://${req.get('host')}/`, '');
      const fullImagePath = path.join(__dirname, '..', imagePath);
      if (fs.existsSync(fullImagePath)) {
        fs.unlinkSync(fullImagePath);
      }
    }

    // Remove image URL from user
    await user.update({
      profile_image: null,
      updated_at: new Date()
    });

    res.json({ message: 'Profile image deleted successfully' });
  } catch (error) {
    console.error('Delete image error:', error);
    res.status(500).json({ message: 'Failed to delete image' });
  }
});

export default router;