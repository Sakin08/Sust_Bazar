import { DataTypes } from "sequelize";
import sequelize from "../../config/database.js";

const Notification = sequelize.define(
  "Notification",
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    type: { type: DataTypes.STRING, allowNull: false }, // like, comment, share
    message: { type: DataTypes.STRING, allowNull: false },
    userId: { type: DataTypes.INTEGER, allowNull: false }, // receiver
    senderId: { type: DataTypes.INTEGER, allowNull: false }, // actor
    isRead: { type: DataTypes.BOOLEAN, defaultValue: false },
  },
  { tableName: "notifications", timestamps: true }
);

export default Notification;
