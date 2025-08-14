import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js'; // make sure this path is correct

const Chat = sequelize.define('Chat', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  product_id: {
    type: DataTypes.INTEGER,
    allowNull: true,  // <-- nullable now
    references: {
      model: 'Products',
      key: 'id',
    },
  },
  accommodation_id: {
    type: DataTypes.INTEGER,
    allowNull: true, // <-- nullable now
    references: {
      model: 'Accommodations',
      key: 'id',
    },
  },
  user1_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'Users',
      key: 'id',
    },
  },
  user2_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'Users',
      key: 'id',
    },
  },
}, {
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
});

export default Chat;
