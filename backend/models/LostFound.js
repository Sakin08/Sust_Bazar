import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const LostFound = sequelize.define('LostFound', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },

  title: { type: DataTypes.STRING, allowNull: false },

  description: { type: DataTypes.TEXT, allowNull: false },

  category: {
    type: DataTypes.ENUM('Electronics','Clothes','Pets','Documents','Others'),
    allowNull: false,
    defaultValue: 'Others',
  },

  type: { // lost or found
    type: DataTypes.ENUM('lost', 'found'),
    allowNull: false,
  },

  location: { type: DataTypes.STRING, allowNull: true },

  image_urls: {
    type: DataTypes.TEXT, // store JSON array
    allowNull: true,
    get() {
      const v = this.getDataValue('image_urls');
      try { return v ? JSON.parse(v) : []; } catch { return []; }
    },
    set(val) {
      this.setDataValue('image_urls', JSON.stringify(val || []));
    }
  },

  contact_info: { type: DataTypes.STRING, allowNull: true },

  posted_by: { // FK -> Users.id
    type: DataTypes.INTEGER,
    allowNull: false,
    references: { model: 'Users', key: 'id' },
  },

}, {
  tableName: 'LostFound',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
});

export default LostFound;
