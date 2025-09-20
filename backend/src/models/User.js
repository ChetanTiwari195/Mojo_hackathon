import { DataTypes } from "sequelize";
import { sequelize } from "../db/index.js"; // your sequelize connection

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
  mobile: {
    type: DataTypes.STRING,
    allowNull: true
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false
  },
  profile_image: {
    type: DataTypes.STRING,
    allowNull: true
  }
}, {
  tableName: "users",
  timestamps: true,
  createdAt: "created_at",
  updatedAt: false
});

export default User;
    