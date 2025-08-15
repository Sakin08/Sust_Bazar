import { Chat, Message, User, Product, Accommodation } from '../models/index.js';
import { Op } from 'sequelize';

// Get all chats for a user
// Get all chats for a user
export const getUserChats = async (req, res) => {
  try {
    const userId = req.user.id;

    const chats = await Chat.findAll({
      where: { [Op.or]: [{ user1_id: userId }, { user2_id: userId }] },
      include: [
        { model: User, as: 'user1', attributes: ['id', 'name', 'email'] },
        { model: User, as: 'user2', attributes: ['id', 'name', 'email'] },
        {
          model: Product,
          as: 'product',
          attributes: ['id', 'title', 'price', 'image_urls'],
          required: false
        },
        {
          model: Accommodation,
          as: 'accommodation',
          attributes: ['id', 'title', 'price', 'images'],
          required: false
        },
        {
          model: Message,
          as: 'messages',
          limit: 1,
          order: [['created_at', 'DESC']],
          include: [{ model: User, as: 'sender', attributes: ['id', 'name'] }],
        },
      ],
      order: [['updated_at', 'DESC']],
    });

    // Format chat results so accommodation.images → accommodation.image_urls (array)
    const formattedChats = chats.map(chat => {
      const chatData = chat.toJSON();

      if (chatData.accommodation && chatData.accommodation.images) {
        let imageUrls;
        try {
          imageUrls = JSON.parse(chatData.accommodation.images); // Convert JSON string to array
        } catch (err) {
          console.error("Error parsing accommodation images:", err);
          imageUrls = [];
        }
        chatData.accommodation.image_urls = Array.isArray(imageUrls) ? imageUrls : [];
      }

      return chatData;
    });

    res.json(formattedChats);
  } catch (error) {
    console.error('Get user chats error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get or create a chat (product or accommodation)
export const getOrCreateChat = async (req, res) => {
  try {
    const { productId, accommodationId } = req.body;
    const userId = req.user.id;

    if (!productId && !accommodationId) {
      return res.status(400).json({ message: 'Product ID or Accommodation ID is required' });
    }

    let item, sellerId, itemType;

    if (productId) {
      item = await Product.findByPk(productId);
      itemType = 'product';
      if (!item) return res.status(404).json({ message: 'Product not found' });
      sellerId = item.seller_id;
    } else {
      item = await Accommodation.findByPk(accommodationId);
      itemType = 'accommodation';
      if (!item) return res.status(404).json({ message: 'Accommodation not found' });
      sellerId = item.userId; // Fixed field
    }

    if (sellerId === userId) {
      return res.status(400).json({ message: 'Cannot chat with yourself' });
    }

    // Check if chat already exists
    let chat = await Chat.findOne({
      where: {
        [Op.or]: [
          { user1_id: userId, user2_id: sellerId },
          { user1_id: sellerId, user2_id: userId },
        ],
        ...(productId ? { product_id: productId } : { accommodation_id: accommodationId }),
      },
    });

    // Create new chat if it doesn't exist
    if (!chat) {
      chat = await Chat.create({
        user1_id: userId,
        user2_id: sellerId,
        product_id: productId || null,
        accommodation_id: accommodationId || null,
      });
    }

    const chatWithDetails = await Chat.findByPk(chat.id, {
      include: [
        { model: User, as: 'user1', attributes: ['id', 'name', 'email'] },
        { model: User, as: 'user2', attributes: ['id', 'name', 'email'] },
        ...(productId
          ? [{ model: Product, as: 'product', attributes: ['id', 'title', 'price', 'image_urls'] }]
          : [{ model: Accommodation, as: 'accommodation', attributes: ['id', 'title', 'price', 'images'] }]),
      ],
    });

    res.json(chatWithDetails);
  } catch (error) {
    console.error('Get or create chat error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get all messages for a chat
export const getChatMessages = async (req, res) => {
  try {
    const { chatId } = req.params;
    const userId = req.user.id;

    const chat = await Chat.findByPk(chatId, {
      include: [
        { model: Product, as: 'product', attributes: ['id', 'title'], required: false },
        { model: Accommodation, as: 'accommodation', attributes: ['id', 'title'], required: false },
      ],
    });
    if (!chat) return res.status(404).json({ message: 'Chat not found' });
    if (chat.user1_id !== userId && chat.user2_id !== userId) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const messages = await Message.findAll({
      where: { chat_id: chatId },
      include: [{ model: User, as: 'sender', attributes: ['id', 'name'] }],
      order: [['created_at', 'ASC']],
    });

    // Mark messages as read
    await Message.update(
      { is_read: true },
      { where: { chat_id: chatId, sender_id: { [Op.ne]: userId } } },
    );

    res.json(messages);
  } catch (error) {
    console.error('Get chat messages error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};
