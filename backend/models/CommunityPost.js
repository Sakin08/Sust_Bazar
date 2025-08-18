// import { DataTypes } from "sequelize";
// import sequelize from "../config/database.js";

// const CommunityPost = sequelize.define(
//   "CommunityPost",
//   {
//     id: {
//       type: DataTypes.INTEGER,
//       primaryKey: true,
//       autoIncrement: true,
//     },
//     title: {
//       type: DataTypes.STRING,
//       allowNull: false,
//     },
//     description: {
//       type: DataTypes.TEXT,
//       allowNull: false,
//     },
//     category: {
//       type: DataTypes.STRING,
//       allowNull: false,
//     },
//     userId: {
//       type: DataTypes.INTEGER,
//       allowNull: false,
//     },
//     tags: {
//       type: DataTypes.TEXT,
//       get() {
//         const rawValue = this.getDataValue("tags");
//         return rawValue ? JSON.parse(rawValue) : [];
//       },
//       set(val) {
//         this.setDataValue("tags", JSON.stringify(val));
//       },
//     },
//     images: {
//       type: DataTypes.TEXT,
//       get() {
//         const rawValue = this.getDataValue("images");
//         return rawValue ? JSON.parse(rawValue) : [];
//       },
//       set(val) {
//         this.setDataValue("images", JSON.stringify(val));
//       },
//     },
//   },
//   {
//     tableName: "community_posts",
//     timestamps: true,
//   }
// );

// export default CommunityPost;
