import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';
import User from './User.js';
import Accommodation from './Accommodation.js';

const AccommodationBooking = sequelize.define('AccommodationBooking', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },

  status: {
    type: DataTypes.ENUM('pending', 'approved', 'rejected'),
    defaultValue: 'pending',
  },

  message: {
    type: DataTypes.TEXT,
    allowNull: true,
  }
}, {
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
});


export default AccommodationBooking;
