import cloudinary from '../config/cloudinary.js';
import { uploadBufferToCloudinary } from '../utils/cloudinaryUpload.js';
import { User, CommunityPost, Comment, Like, Share } from '../models/index.js';
import jwt from 'jsonwebtoken';
import { validationResult } from 'express-validator';

// ------------------- REGISTER -------------------
export const register = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  try {
    const { name, email, password, phone, department, season, address } = req.body;

    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) return res.status(400).json({ message: 'User already exists with this email' });

    const user = await User.create({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password,
      phone: phone.trim(),
      department: department.trim(),
      season: season.trim(),
      address: address ? address.trim() : null,
    });

    const token = jwt.sign({ id: user.id, email: user.email }, process.env.JWT_SECRET, { expiresIn: '30d' });

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

    res.status(201).json({ message: 'User registered successfully', token, user: userResponse });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Server error during registration' });
  }
};

// ------------------- LOGIN -------------------
export const login = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  try {
    const { email, password } = req.body;

    const user = await User.findOne({ where: { email: email.toLowerCase().trim() } });
    if (!user) return res.status(401).json({ message: 'Invalid credentials' });
    if (user.is_banned) return res.status(403).json({ message: 'Account has been banned' });

    const isValidPassword = await user.comparePassword(password);
    if (!isValidPassword) return res.status(401).json({ message: 'Invalid credentials' });

    const token = jwt.sign({ id: user.id, email: user.email }, process.env.JWT_SECRET, { expiresIn: '30d' });

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
      profile_image: user.profile_image,
    };

    res.json({ message: 'Login successful', token, user: userResponse });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error during login' });
  }
};

// ------------------- GET OWN PROFILE -------------------
export const getProfile = async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id, { attributes: { exclude: ['password'] } });
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// -------------------- Get User Profile by ID --------------------
export const getUserProfile = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await User.findByPk(id, {
      attributes: [
        "id",
        "name", 
        "email",
        "profile_image",
        "department",
        "season",
        "address",
        "created_at"
      ],
      include: [
        {
          model: CommunityPost,
          as: "posts",
          include: [
            { model: User, as: "author", attributes: ["id", "name", "profile_image"] },
            { model: Comment, as: "comments", include: [{ model: User, as: "author", attributes: ["id", "name", "profile_image"] }] },
            { model: Like, as: "likes" },
            { model: Share, as: "shares" }
          ],
          order: [["createdAt", "DESC"]]
        }
      ]
    });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json(user);
  } catch (err) {
    console.error("Get user profile error:", err);
    res.status(500).json({ message: "Internal Server Error", error: err.message });
  }
};

// -------------------- Get All Users (Admin) --------------------
export const getAllUsers = async (req, res) => {
  try {
    const users = await User.findAll({
      attributes: [
        "id",
        "name", 
        "email",
        "profile_image",
        "department",
        "season",
        "role",
        "is_banned",
        "created_at"
      ],
      order: [["created_at", "DESC"]]
    });

    res.json(users);
  } catch (err) {
    console.error("Get all users error:", err);
    res.status(500).json({ message: "Internal Server Error", error: err.message });
  }
};

// -------------------- Update User Profile --------------------
export const updateUserProfile = async (req, res) => {
  try {
    const userId = req.user.id; // Get from authenticated user, not params
    const { name, department, season, address } = req.body;

    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    let profile_image_url = user.profile_image;

    // Handle image upload if file is provided
    if (req.file) {
      try {
        const uploadResult = await uploadBufferToCloudinary(req.file.buffer, "profiles");
        profile_image_url = uploadResult.secure_url;
      } catch (uploadError) {
        console.error("Image upload error:", uploadError);
        return res.status(500).json({ message: "Failed to upload image" });
      }
    }

    // Update user fields
    await user.update({
      name: name || user.name,
      department: department || user.department,
      season: season || user.season,
      address: address || user.address,
      profile_image: profile_image_url
    });

    // Return updated user (without password)
    const updatedUser = await User.findByPk(userId, {
      attributes: [
        "id",
        "name", 
        "email",
        "profile_image",
        "department",
        "season",
        "address",
        "created_at"
      ]
    });

    res.json(updatedUser);
  } catch (err) {
    console.error("Update user profile error:", err);
    res.status(500).json({ message: "Internal Server Error", error: err.message });
  }
};

// -------------------- Ban/Unban User (Admin only) --------------------
export const toggleUserBan = async (req, res) => {
  try {
    const { id } = req.params;

    // Only admins can ban/unban users
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Admin access required" });
    }

    const user = await User.findByPk(id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Toggle ban status
    user.is_banned = !user.is_banned;
    await user.save();

    res.json({ 
      message: `User ${user.is_banned ? 'banned' : 'unbanned'} successfully`,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        is_banned: user.is_banned
      }
    });
  } catch (err) {
    console.error("Toggle user ban error:", err);
    res.status(500).json({ message: "Internal Server Error", error: err.message });
  }
};