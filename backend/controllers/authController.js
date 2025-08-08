import jwt from 'jsonwebtoken';
import { User } from '../models/index.js';

export const register = async (req, res) => {
  try {
    const { name, email, password, phone, department, season, address } = req.body;
    
    console.log('Registration data received:', req.body); // DEBUG: See what's being sent
    
    // Validate required fields
    if (!name || name.trim().length < 2) {
      return res.status(400).json({ 
        message: 'Name is required and must be at least 2 characters',
        field: 'name'
      });
    }
    
    if (!email || !email.endsWith('@student.sust.edu')) {
      return res.status(400).json({ 
        message: 'Valid SUST student email is required',
        field: 'email'
      });
    }
    
    if (!password || password.length < 6) {
      return res.status(400).json({ 
        message: 'Password must be at least 6 characters',
        field: 'password'
      });
    }
    
    if (!phone || phone.trim().length < 10) {
      return res.status(400).json({ 
        message: 'Phone number is required and must be at least 10 digits',
        field: 'phone'
      });
    }
    
    if (!department || department.trim().length < 2) {
      return res.status(400).json({ 
        message: 'Department is required',
        field: 'department'
      });
    }
    
    if (!season || season.trim().length < 4) {
      return res.status(400).json({ 
        message: 'Season is required (e.g., Spring 2025)',
        field: 'season'
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ 
        message: 'User already exists with this email',
        field: 'email'
      });
    }

    // Create user with all required fields
    const user = await User.create({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password,
      phone: phone.trim(),
      department: department.trim(),
      season: season.trim(),
      address: address ? address.trim() : null // address is optional
    });

    // Generate JWT token
    const token = jwt.sign(
      { id: user.id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: '30d' }
    );

    // Return user data without password
    const userResponse = {
      id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      department: user.department,
      season: user.season,
      address: user.address,
      role: user.role,
      created_at: user.created_at
    };

    res.status(201).json({
      message: 'User registered successfully',
      token,
      user: userResponse
    });
    
  } catch (error) {
    console.error('Registration error:', error);
    
    // Handle Sequelize validation errors
    if (error.name === 'SequelizeValidationError') {
      const validationErrors = error.errors.map(err => ({
        field: err.path,
        message: err.message,
        value: err.value
      }));
      
      return res.status(400).json({ 
        message: 'Validation failed', 
        errors: validationErrors 
      });
    }
    
    // Handle unique constraint errors
    if (error.name === 'SequelizeUniqueConstraintError') {
      return res.status(400).json({ 
        message: 'Email already exists',
        field: 'email'
      });
    }
    
    res.status(500).json({ 
      message: 'Server error during registration',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    // Find user by email
    const user = await User.findOne({ where: { email: email.toLowerCase().trim() } });
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Check if user is banned
    if (user.is_banned) {
      return res.status(403).json({ message: 'Account has been banned' });
    }

    // Verify password
    const isValidPassword = await user.comparePassword(password);
    if (!isValidPassword) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Generate JWT token
    const token = jwt.sign(
      { id: user.id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: '30d' }
    );

    // Return user data without password
    const userResponse = {
      id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      department: user.department,
      season: user.season,
      address: user.address,
      role: user.role,
      created_at: user.created_at
    };

    res.json({
      message: 'Login successful',
      token,
      user: userResponse
    });
    
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error during login' });
  }
};