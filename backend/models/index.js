import sequelize from '../config/database.js';
import User from './User.js';
import Product from './Product.js';
import Chat from './Chat.js';
import Message from './Message.js';

// Associations

// User - Product
User.hasMany(Product, { foreignKey: 'seller_id', as: 'products' });
Product.belongsTo(User, { foreignKey: 'seller_id', as: 'seller' });

// Product - Chat
Product.hasMany(Chat, { foreignKey: 'product_id', as: 'chats' });
Chat.belongsTo(Product, { foreignKey: 'product_id', as: 'product' });

// User - Chat (as participants)
User.hasMany(Chat, { foreignKey: 'user1_id', as: 'initiated_chats' });
User.hasMany(Chat, { foreignKey: 'user2_id', as: 'received_chats' });
Chat.belongsTo(User, { foreignKey: 'user1_id', as: 'user1' });
Chat.belongsTo(User, { foreignKey: 'user2_id', as: 'user2' });

// Chat - Message
Chat.hasMany(Message, { foreignKey: 'chat_id', as: 'messages' });
Message.belongsTo(Chat, { foreignKey: 'chat_id', as: 'chat' });

// User - Message (sender)
User.hasMany(Message, { foreignKey: 'sender_id', as: 'sent_messages' });
Message.belongsTo(User, { foreignKey: 'sender_id', as: 'sender' });

export {
  sequelize,
  User,
  Product,
  Chat,
  Message,
};
