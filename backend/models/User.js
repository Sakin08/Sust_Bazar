import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';
import bcrypt from 'bcryptjs';

const User = sequelize.define('User', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },

  name: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      len: [2, 50],
    },
  },

  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    validate: {
      isEmail: true,
      customValidator(value) {
        if (!value.endsWith('@student.sust.edu')) {
          throw new Error('Only SUST student emails are allowed');
        }
      },
    },
  },

  phone: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      is: /^[0-9]{10,15}$/, // 10–15 digits
    },
  },

  department: {
    type: DataTypes.STRING,
    allowNull: false,
  },

  season: {
    type: DataTypes.STRING,
    allowNull: false, // e.g. "Spring 2025"
  },

  address: {
    type: DataTypes.TEXT,
    allowNull: true,
  },

  password: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      len: [6, 100],
    },
  },

  role: {
    type: DataTypes.ENUM('user', 'admin'),
    defaultValue: 'user',
  },

  is_banned: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
}, {
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
});

// Hash password before creating
User.beforeCreate(async (user) => {
  if (user.password) {
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(user.password, salt);
  }
});

// Method to compare passwords
User.prototype.comparePassword = async function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

export default User;
