import { DataTypes, Sequelize } from "sequelize"; // Make sure to import Sequelize for DataTypes.NOW
import { sequelize } from "../db/index.js";

const User = sequelize.define("User", {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  role: {
    type: DataTypes.ENUM("Admin", "Invoicing", "Contact"),
    allowNull: false
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false
  },
  profile_image: {
    type: DataTypes.STRING,
    allowNull: true
  },
  // Add this block to explicitly define the column and its default value
  created_at: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
  }
}, {
  tableName: "users",
  timestamps: true,
  createdAt: "created_at", // This mapping is still important
  updatedAt: false         // Keep this as you don't have an updatedAt column
});

export default User;