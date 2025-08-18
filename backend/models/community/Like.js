import { DataTypes } from "sequelize";
import sequelize from "../../config/database.js";

const Like = sequelize.define(
  "Like",
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    userId: { type: DataTypes.INTEGER, allowNull: false },
    postId: { type: DataTypes.INTEGER, allowNull: false },
  },
  { tableName: "community_likes", timestamps: true }
);

export default Like;
