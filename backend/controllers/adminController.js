import { User, Product, Chat, Message, Accommodation } from '../models/index.js';

// Fetch all accommodations


// Fetch all accommodations
export const getAllAccommodations = async (req, res) => {
  try {
    const accommodations = await Accommodation.findAll({
      include: [
        {
          model: User,
          as: 'owner', // association defined in index.js
          attributes: ['id', 'name', 'email', 'phone', 'season', 'profile_image']
        }
      ],
      attributes: [
        'id',
        'title',
        'description',
        'price',        // changed from price_per_night
        'location',
        'images',       // changed from image_urls
        'is_available', // changed from is_booked
        'created_at'
      ],
      order: [['created_at', 'DESC']]
    });

    // Parse images JSON and send formatted data
    const formattedAccommodations = accommodations.map(acc => ({
      ...acc.toJSON(),
      images: acc.images ? JSON.parse(acc.images) : [],
    }));

    res.json(formattedAccommodations);
  } catch (error) {
    console.error('Get all accommodations error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};




// Delete an accommodation
export const deleteAccommodation = async (req, res) => {
  try {
    const { accommodationId } = req.params;
    const accommodation = await Accommodation.findByPk(accommodationId);
    if (!accommodation) return res.status(404).json({ message: 'Accommodation not found' });

    await accommodation.destroy();
    res.json({ message: 'Accommodation deleted successfully' });
  } catch (error) {
    console.error('Delete accommodation error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const getAllUsers = async (req, res) => {
  try {
    const users = await User.findAll({
      attributes: ['id', 'name', 'email','phone', 'role','department','season', 'profile_image','is_banned', 'created_at'],
      order: [['created_at', 'DESC']]
    });
    res.json(users);
  } catch (error) {
    console.error('Get all users error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const getAllProducts = async (req, res) => {
  try {
    const products = await Product.findAll({
      include: [{
        model: User,
        as: 'seller',
        attributes: ['id', 'name', 'email', 'phone', 'season', 'profile_image']

      }],
      order: [['created_at', 'DESC']]
    });
    res.json(products);
  } catch (error) {
    console.error('Get all products error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const banUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const { banned } = req.body;
    const user = await User.findByPk(userId);
    if (!user) return res.status(404).json({ message: 'User not found' });

    if (user.role === 'admin') {
      return res.status(400).json({ message: 'Cannot ban admin users' });
    }

    await user.update({ is_banned: banned });
    res.json({
      message: `User ${banned ? 'banned' : 'unbanned'} successfully`,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        is_banned: user.is_banned
      }
    });
  } catch (error) {
    console.error('Ban user error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const deleteProduct = async (req, res) => {
  try {
    const { productId } = req.params;
    const product = await Product.findByPk(productId);
    if (!product) return res.status(404).json({ message: 'Product not found' });

    await product.destroy();
    res.json({ message: 'Product deleted successfully' });
  } catch (error) {
    console.error('Delete product error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const getStats = async (req, res) => {
  try {
    const totalUsers = await User.count();
    const totalProducts = await Product.count();
    const totalChats = await Chat.count();
    const totalMessages = await Message.count();
    res.json({ totalUsers, totalProducts, totalChats, totalMessages });
  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};



