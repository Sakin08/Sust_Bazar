import { Chat, Message, User, Product } from '../models/index.js';
import { Op } from 'sequelize';

export const getUserChats = async (req, res) => {
  try {
    const userId = req.user.id;
    const chats = await Chat.findAll({
      where: { [Op.or]: [{ user1_id: userId }, { user2_id: userId }] },
      include: [
        { model: User, as: 'user1', attributes: ['id', 'name', 'email'] },
        { model: User, as: 'user2', attributes: ['id', 'name', 'email'] },
        { model: Product, as: 'product', attributes: ['id', 'title', 'price', 'image_urls'] },
        {
          model: Message,
          as: 'messages',
          limit: 1,
          order: [['created_at', 'DESC']],
          include: [{ model: User, as: 'sender', attributes: ['id', 'name'] }]
        }
      ],
      order: [['updated_at', 'DESC']],
    });
    res.json(chats);
  } catch (error) {
    console.error('Get user chats error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const getOrCreateChat = async (req, res) => {
  try {
    const { productId } = req.body;
    const userId = req.user.id;

    const product = await Product.findByPk(productId);
    if (!product) return res.status(404).json({ message: 'Product not found' });
    if (product.seller_id === userId) return res.status(400).json({ message: 'Cannot chat with yourself' });

    let chat = await Chat.findOne({
      where: {
        product_id: productId,
        [Op.or]: [
          { user1_id: userId, user2_id: product.seller_id },
          { user1_id: product.seller_id, user2_id: userId }
        ]
      }
    });

    if (!chat) {
      chat = await Chat.create({ product_id: productId, user1_id: userId, user2_id: product.seller_id });
    }

    const chatWithDetails = await Chat.findByPk(chat.id, {
      include: [
        { model: User, as: 'user1', attributes: ['id', 'name', 'email'] },
        { model: User, as: 'user2', attributes: ['id', 'name', 'email'] },
        { model: Product, as: 'product', attributes: ['id', 'title', 'price', 'image_urls'] }
      ]
    });

    res.json(chatWithDetails);
  } catch (error) {
    console.error('Get or create chat error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const getChatMessages = async (req, res) => {
  try {
    const { chatId } = req.params;
    const userId = req.user.id;

    const chat = await Chat.findByPk(chatId);
    if (!chat) return res.status(404).json({ message: 'Chat not found' });
    if (chat.user1_id !== userId && chat.user2_id !== userId)
      return res.status(403).json({ message: 'Access denied' });

    const messages = await Message.findAll({
      where: { chat_id: chatId },
      include: [{ model: User, as: 'sender', attributes: ['id', 'name'] }],
      order: [['created_at', 'ASC']]
    });

    // Mark messages as read
    await Message.update(
      { is_read: true },
      { where: { chat_id: chatId, sender_id: { [Op.ne]: userId } } }
    );

    res.json(messages);
  } catch (error) {
    console.error('Get chat messages error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};
