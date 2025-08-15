import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const BookLend = sequelize.define('BookLend', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },

  title: { type: DataTypes.STRING, allowNull: false },
  author: { type: DataTypes.STRING, allowNull: true },
  description: { type: DataTypes.TEXT, allowNull: true },

  cover_image: { type: DataTypes.STRING, allowNull: true }, // single URL

  status: { // available / borrowed
    type: DataTypes.ENUM('available', 'borrowed'),
    allowNull: false,
    defaultValue: 'available',
  },

  lender_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: { model: 'Users', key: 'id' },
  },

  borrower_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: { model: 'Users', key: 'id' },
  },

}, {
  tableName: 'BookLend',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
});

export default BookLend;
