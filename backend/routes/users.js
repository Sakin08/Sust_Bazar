import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { User } from '../models/index.js';
import { authenticate } from '../middleware/auth.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = express.Router();

// Multer setup for profile image uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '..', 'uploads', 'profiles');
    if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, 'profile-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image/')) cb(null, true);
  else cb(new Error('Only image files are allowed!'), false);
};

const upload = multer({ 
  storage, 
  fileFilter, 
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
});

// GET profile
router.get('/profile', authenticate, async (req, res) => {
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

// PUT update profile
router.put('/profile', authenticate, async (req, res) => {
  try {
    const userId = req.user.id;
    const { name, email, phone, address, department, season, bio, profileImage } = req.body;

    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Update user with all fields, including profile image if provided
    await user.update({
      name: name ?? user.name,
      email: email ?? user.email,
      phone: phone ?? user.phone,
      address: address ?? user.address,
      department: department ?? user.department,
      season: season ?? user.season,
      bio: bio ?? user.bio,
      profile_image: profileImage ?? user.profile_image // Fix: Handle profile image in regular update
    });

    // Return updated user without password
    const updatedUser = await User.findByPk(userId, { 
      attributes: { exclude: ['password'] } 
    });

    res.json({ 
      message: 'Profile updated successfully', 
      user: updatedUser,
      success: true 
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ 
      message: 'Server error',
      success: false 
    });
  }
});

// POST upload profile image
router.post('/upload-profile-image', authenticate, upload.single('profileImage'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No image file provided' });
    }

    const user = await User.findByPk(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Delete old image if exists
    if (user.profile_image) {
      try {
        // Extract the relative path from the full URL
        const oldImageUrl = user.profile_image;
        const baseUrl = `${req.protocol}://${req.get('host')}/`;
        
        if (oldImageUrl.startsWith(baseUrl)) {
          const relativePath = oldImageUrl.replace(baseUrl, '');
          const fullOldPath = path.join(__dirname, '..', relativePath);
          
          if (fs.existsSync(fullOldPath)) {
            fs.unlinkSync(fullOldPath);
            console.log('Old profile image deleted:', fullOldPath);
          }
        }
      } catch (deleteError) {
        console.error('Error deleting old image:', deleteError);
        // Continue with upload even if delete fails
      }
    }

    // Create the image URL
    const relativePath = path.relative(path.join(__dirname, '..'), req.file.path);
    const imageUrl = `${req.protocol}://${req.get('host')}/${relativePath.replace(/\\/g, '/')}`;

    // Update user with new profile image
    await user.update({ profile_image: imageUrl });

    // Get updated user data
    const updatedUser = await User.findByPk(req.user.id, { 
      attributes: { exclude: ['password'] } 
    });

    res.json({ 
      message: 'Profile image uploaded successfully', 
      imageUrl,
      user: updatedUser,
      success: true 
    });
  } catch (error) {
    console.error('Upload image error:', error);
    
    // Clean up uploaded file if there was an error
    if (req.file && fs.existsSync(req.file.path)) {
      try {
        fs.unlinkSync(req.file.path);
      } catch (cleanupError) {
        console.error('Error cleaning up file:', cleanupError);
      }
    }
    
    res.status(500).json({ 
      message: error.message || 'Failed to upload image',
      success: false 
    });
  }
});

// DELETE profile image
router.delete('/profile-image', authenticate, async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (user.profile_image) {
      try {
        // Extract the relative path from the full URL
        const imageUrl = user.profile_image;
        const baseUrl = `${req.protocol}://${req.get('host')}/`;
        
        if (imageUrl.startsWith(baseUrl)) {
          const relativePath = imageUrl.replace(baseUrl, '');
          const fullImagePath = path.join(__dirname, '..', relativePath);
          
          if (fs.existsSync(fullImagePath)) {
            fs.unlinkSync(fullImagePath);
            console.log('Profile image deleted:', fullImagePath);
          }
        }
      } catch (deleteError) {
        console.error('Error deleting image file:', deleteError);
        // Continue with database update even if file delete fails
      }
    }

    // Update user to remove profile image
    await user.update({ profile_image: null });

    // Get updated user data
    const updatedUser = await User.findByPk(req.user.id, { 
      attributes: { exclude: ['password'] } 
    });

    res.json({ 
      message: 'Profile image deleted successfully',
      user: updatedUser,
      success: true 
    });
  } catch (error) {
    console.error('Delete image error:', error);
    res.status(500).json({ 
      message: 'Failed to delete image',
      success: false 
    });
  }
});

export default router;