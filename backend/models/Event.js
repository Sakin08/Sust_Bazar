import { DataTypes } from 'sequelize';
import db from '../config/database.js';
import User from './User.js';

const Event = db.define('Event', {
  title: { type: DataTypes.STRING, allowNull: false },
  description: { type: DataTypes.TEXT },
  event_date: { type: DataTypes.DATE, allowNull: false },
  media_url: { type: DataTypes.STRING },
});

// Association with User
Event.belongsTo(User, { as: 'creator', foreignKey: 'created_by' });
User.hasMany(Event, { foreignKey: 'created_by' });

export default Event;
