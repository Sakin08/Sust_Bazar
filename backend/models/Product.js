import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const Product = sequelize.define('Product', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      len: [2, 100], // Changed from [3, 100] to allow 2-character titles
    },
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  price: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    validate: {
      min: 0,
    },
  },
  category: {
    type: DataTypes.ENUM('Electronics', 'Books', 'Clothing', 'Furniture', 'Sports', 'Others'),
    allowNull: false,
  },
  image_urls: {
    type: DataTypes.TEXT,
    get() {
      const value = this.getDataValue('image_urls');
      return value ? JSON.parse(value) : [];
    },
    set(value) {
      this.setDataValue('image_urls', JSON.stringify(value));
    },
  },
  seller_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'Users',
      key: 'id',
    },
  },
  is_sold: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
}, {
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
});

export default Product;