import { DataTypes } from "sequelize";
import sequelize from "../../config/database.js";

const Share = sequelize.define(
  "Share",
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    userId: { type: DataTypes.INTEGER, allowNull: false },
    postId: { type: DataTypes.INTEGER, allowNull: false },
  },
  { tableName: "community_shares", timestamps: true }
);

export default Share;
