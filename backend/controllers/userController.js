import cloudinary from '../config/cloudinary.js';
import { uploadBufferToCloudinary } from '../utils/cloudinaryUpload.js';
import { User } from '../models/index.js';
import jwt from 'jsonwebtoken';
import { validationResult } from 'express-validator';

export const register = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { name, email, password, phone, department, season, address } = req.body;

    // Check if user exists
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists with this email' });
    }

    const user = await User.create({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password,
      phone: phone.trim(),
      department: department.trim(),
      season: season.trim(),
      address: address ? address.trim() : null,
    });

    const token = jwt.sign({ id: user.id, email: user.email }, process.env.JWT_SECRET, {
      expiresIn: '30d',
    });

    const userResponse = {
      id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      department: user.department,
      season: user.season,
      address: user.address,
      role: user.role,
      created_at: user.created_at,
    };

    res.status(201).json({
      message: 'User registered successfully',
      token,
      user: userResponse,
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Server error during registration' });
  }
};

export const login = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { email, password } = req.body;

    const user = await User.findOne({ where: { email: email.toLowerCase().trim() } });
    if (!user) return res.status(401).json({ message: 'Invalid credentials' });
    if (user.is_banned) return res.status(403).json({ message: 'Account has been banned' });

    const isValidPassword = await user.comparePassword(password);
    if (!isValidPassword) return res.status(401).json({ message: 'Invalid credentials' });

    const token = jwt.sign({ id: user.id, email: user.email }, process.env.JWT_SECRET, {
      expiresIn: '30d',
    });

    const userResponse = {
      id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      department: user.department,
      season: user.season,
      address: user.address,
      role: user.role,
      created_at: user.created_at,
    };

    res.json({ message: 'Login successful', token, user: userResponse });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error during login' });
  }
};

export const getProfile = async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id, {
      attributes: { exclude: ['password'] }
    });
    if (!user) return res.status(404).json({ message: 'User not found' });

    res.json(user);
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const updateUserProfile = async (req, res) => {
  try {
    const userId = req.user.id; // from JWT authenticate middleware
    const { name, phone, department, season, address, bio } = req.body;

    const user = await User.findByPk(userId);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    // Prepare update data
    const updateData = {};
    if (name) updateData.name = name.trim();
    if (phone) updateData.phone = phone.trim();
    if (department) updateData.department = department.trim();
    if (season) updateData.season = season.trim();
    if (address !== undefined) updateData.address = address.trim();

    // Handle image upload if file exists
    if (req.file && req.file.buffer) {
      const uploadResult = await uploadBufferToCloudinary(req.file.buffer, 'profile_images');
      updateData.profile_image = uploadResult.secure_url;
    }

    await user.update(updateData);

    // Return updated user excluding password
    const updatedUser = await User.findByPk(userId, {
      attributes: { exclude: ['password'] },
    });

    res.json({ success: true, message: 'Profile updated successfully', user: updatedUser });
  } catch (error) {
    console.error('Profile update error:', error);
    res.status(500).json({ success: false, message: 'Server error during profile update' });
  }
};
