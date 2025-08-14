import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';
import User from './User.js';

const Accommodation = sequelize.define('Accommodation', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  type: {
    type: DataTypes.ENUM('Flat', 'Room', 'Seat'),
    allowNull: false,
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  location: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  price: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
  },
  gender_preference: {
    type: DataTypes.ENUM('Male', 'Female', 'Any'),
    defaultValue: 'Any',
  },
  facilities: {
    type: DataTypes.TEXT, // store as comma-separated or JSON string
    allowNull: true,
  },
  images: {
    type: DataTypes.TEXT, // JSON array of URLs
    allowNull: true,
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'Users',
      key: 'id',
    },
  },
  is_available: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
  },
}, {
  tableName: 'Accommodations', // Explicitly set table name
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
});

export default Accommodation;