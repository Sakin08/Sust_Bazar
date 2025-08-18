import sequelize from "../config/database.js";

// Base models
import User from "./User.js";
import Product from "./Product.js";
import Chat from "./Chat.js";
import Message from "./Message.js";
import Accommodation from "./Accommodation.js";
import AccommodationBooking from "./AccommodationBooking.js";


// Community models
import CommunityPost from "./community/CommunityPost.js";
import Comment from "./community/Comment.js";
import Like from "./community/Like.js";
import Share from "./community/Share.js";
import Notification from "./community/Notification.js";

// ------------------- Product Associations -------------------
User.hasMany(Product, { foreignKey: "seller_id", as: "products" });
Product.belongsTo(User, { foreignKey: "seller_id", as: "seller" });

Product.hasMany(Chat, { foreignKey: "product_id", as: "chats" });
Chat.belongsTo(Product, { foreignKey: "product_id", as: "product" });

// ------------------- Chat Associations -------------------
User.hasMany(Chat, { foreignKey: "user1_id", as: "initiated_chats" });
User.hasMany(Chat, { foreignKey: "user2_id", as: "received_chats" });
Chat.belongsTo(User, { foreignKey: "user1_id", as: "user1" });
Chat.belongsTo(User, { foreignKey: "user2_id", as: "user2" });

Chat.hasMany(Message, { foreignKey: "chat_id", as: "messages" });
Message.belongsTo(Chat, { foreignKey: "chat_id", as: "chat" });

User.hasMany(Message, { foreignKey: "sender_id", as: "sent_messages" });
Message.belongsTo(User, { foreignKey: "sender_id", as: "sender" });

// ------------------- Accommodation Associations -------------------
User.hasMany(Accommodation, { foreignKey: "userId", as: "accommodations" });
Accommodation.belongsTo(User, { foreignKey: "userId", as: "owner" });

Accommodation.hasMany(AccommodationBooking, { foreignKey: "accommodation_id", as: "bookings" });
AccommodationBooking.belongsTo(Accommodation, { foreignKey: "accommodation_id", as: "accommodation" });

User.hasMany(AccommodationBooking, { foreignKey: "renter_id", as: "renter_bookings" });
AccommodationBooking.belongsTo(User, { foreignKey: "renter_id", as: "renter" });

// Accommodation Chat link
Accommodation.hasMany(Chat, { foreignKey: "accommodation_id", as: "chats" });
Chat.belongsTo(Accommodation, { foreignKey: "accommodation_id", as: "accommodation" });

// ------------------- Community Associations -------------------
User.hasMany(CommunityPost, { foreignKey: "userId", as: "posts" });
CommunityPost.belongsTo(User, { foreignKey: "userId", as: "author" });

CommunityPost.hasMany(Comment, { foreignKey: "postId", as: "comments" });
Comment.belongsTo(CommunityPost, { foreignKey: "postId" });

User.hasMany(Comment, { foreignKey: "userId", as: "comments" });
Comment.belongsTo(User, { foreignKey: "userId", as: "author" });

CommunityPost.hasMany(Like, { foreignKey: "postId", as: "likes" });
Like.belongsTo(CommunityPost, { foreignKey: "postId" });

User.hasMany(Like, { foreignKey: "userId", as: "likes" });
Like.belongsTo(User, { foreignKey: "userId" });

CommunityPost.hasMany(Share, { foreignKey: "postId", as: "shares" });
Share.belongsTo(CommunityPost, { foreignKey: "postId" });

User.hasMany(Share, { foreignKey: "userId", as: "shares" });
Share.belongsTo(User, { foreignKey: "userId" });

User.hasMany(Notification, { foreignKey: "userId", as: "notifications" });
Notification.belongsTo(User, { foreignKey: "userId", as: "receiver" });
Notification.belongsTo(User, { foreignKey: "senderId", as: "sender" });



// ------------------- Export Models -------------------
export {
  sequelize,
  User,
  Product,
  Chat,
  Message,
  Accommodation,
  AccommodationBooking,

  CommunityPost,
  Comment,
  Like,
  Share,
  Notification,
};
