import sequelize from '../config/database.js';
import User from './User.js';
import Product from './Product.js';
import Chat from './Chat.js';
import Message from './Message.js';
import Accommodation from './Accommodation.js';
import AccommodationBooking from './AccommodationBooking.js';

// Existing Associations
User.hasMany(Product, { foreignKey: 'seller_id', as: 'products' });
Product.belongsTo(User, { foreignKey: 'seller_id', as: 'seller' });

Product.hasMany(Chat, { foreignKey: 'product_id', as: 'chats' });
Chat.belongsTo(Product, { foreignKey: 'product_id', as: 'product' });

User.hasMany(Chat, { foreignKey: 'user1_id', as: 'initiated_chats' });
User.hasMany(Chat, { foreignKey: 'user2_id', as: 'received_chats' });
Chat.belongsTo(User, { foreignKey: 'user1_id', as: 'user1' });
Chat.belongsTo(User, { foreignKey: 'user2_id', as: 'user2' });

Chat.hasMany(Message, { foreignKey: 'chat_id', as: 'messages' });
Message.belongsTo(Chat, { foreignKey: 'chat_id', as: 'chat' });

User.hasMany(Message, { foreignKey: 'sender_id', as: 'sent_messages' });
Message.belongsTo(User, { foreignKey: 'sender_id', as: 'sender' });

// New Accommodation Associations
User.hasMany(Accommodation, { foreignKey: 'userId', as: 'accommodations' });
Accommodation.belongsTo(User, { foreignKey: 'userId', as: 'owner' });

Accommodation.hasMany(AccommodationBooking, { foreignKey: 'accommodation_id', as: 'bookings' });
AccommodationBooking.belongsTo(Accommodation, { foreignKey: 'accommodation_id', as: 'accommodation' });

User.hasMany(AccommodationBooking, { foreignKey: 'renter_id', as: 'renter_bookings' });
AccommodationBooking.belongsTo(User, { foreignKey: 'renter_id', as: 'renter' });

export {
  sequelize,
  User,
  Product,
  Chat,
  Message,
  Accommodation,
  AccommodationBooking
};