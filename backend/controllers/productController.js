import { Product, User } from '../models/index.js';
import { Op } from 'sequelize';
import { uploadBufferToCloudinary } from '../utils/cloudinaryUpload.js';

export const getAllProducts = async (req, res) => {
  try {
    const { category, search, page = 1, limit = 12 } = req.query;
    const offset = (page - 1) * limit;

    let whereClause = { is_sold: false };
    if (category && category !== 'all') {
      whereClause.category = category;
    }
    if (search) {
      whereClause[Op.or] = [
        { title: { [Op.like]: `%${search}%` } },
        { description: { [Op.like]: `%${search}%` } }
      ];
    }

    const products = await Product.findAndCountAll({
      where: whereClause,
      include: [{
        model: User,
        as: 'seller',
        attributes: ['id', 'name', 'email']
      }],
      order: [['created_at', 'DESC']],
      limit: parseInt(limit),
      offset: parseInt(offset)
    });

    // Since your model has getters, image_urls will already be parsed
    const productsWithParsedImages = products.rows.map(p => p.toJSON());

    res.json({
      products: productsWithParsedImages,
      totalPages: Math.ceil(products.count / limit),
      currentPage: parseInt(page),
      total: products.count
    });
  } catch (error) {
    console.error('Get products error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const getProduct = async (req, res) => {
  try {
    const { id } = req.params;
    
    const product = await Product.findByPk(id, {
      include: [{
        model: User,
        as: 'seller',
        attributes: ['id', 'name', 'email']
      }]
    });

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // Model getter will handle parsing automatically
    res.json(product.toJSON());
  } catch (error) {
    console.error('Get product error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const createProduct = async (req, res) => {
  try {
    const { title, description, price, category } = req.body;
    const seller_id = req.user.id;
    
    // Validate title length
    if (!title || title.trim().length < 2) {
      return res.status(400).json({ 
        message: 'Title must be at least 2 characters long',
        field: 'title'
      });
    }
    
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ message: 'Please upload at least one image.' });
    }

    // Upload images to Cloudinary concurrently
    const uploadResults = await Promise.all(
      req.files.map(file => uploadBufferToCloudinary(file.buffer, 'products'))
    );

    const image_urls = uploadResults.map(result => result.secure_url);

    const product = await Product.create({
      title: title.trim(),
      description,
      price: parseFloat(price),
      category,
      image_urls, // Model setter will handle JSON.stringify automatically
      seller_id
    });

    res.status(201).json({
      message: 'Product created successfully',
      product: product.toJSON() // Getter will handle parsing automatically
    });
  } catch (error) {
    console.error('Create product error:', error);
    
    // Handle Sequelize validation errors specifically
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
    
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;
    
    const product = await Product.findByPk(id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    if (product.seller_id !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }

    await product.destroy();
    res.json({ message: 'Product deleted successfully' });
  } catch (error) {
    console.error('Delete product error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const getUserProducts = async (req, res) => {
  try {
    const products = await Product.findAll({
      where: { seller_id: req.user.id },
      order: [['created_at', 'DESC']]
    });

    // Model getters will handle image_urls parsing automatically
    res.json(products.map(p => p.toJSON()));
  } catch (error) {
    console.error('Get user products error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, price, category, is_sold } = req.body;

    const product = await Product.findByPk(id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    if (product.seller_id !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }

    // If new images are uploaded, upload them to Cloudinary
    let image_urls = product.image_urls; // getter returns parsed array
    if (req.files && req.files.length > 0) {
      const uploadResults = await Promise.all(
        req.files.map(file => uploadBufferToCloudinary(file.buffer, 'products'))
      );
      image_urls = uploadResults.map(result => result.secure_url);
    }

    await product.update({
      title: title !== undefined ? title.trim() : product.title,
      description: description !== undefined ? description : product.description,
      price: price !== undefined ? parseFloat(price) : product.price,
      category: category !== undefined ? category : product.category,
      is_sold: is_sold !== undefined ? is_sold : product.is_sold,
      image_urls, // setter will handle JSON.stringify automatically
    });

    res.json({
      message: 'Product updated successfully',
      product: product.toJSON(), // getter will handle parsing automatically
    });
  } catch (error) {
    console.error('Update product error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};