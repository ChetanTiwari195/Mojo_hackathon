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
  timestamps: true,          // ✅ enable timestamps
  createdAt: "created_at",   // ✅ map to your column
  updatedAt: false           // ✅ disable updatedAt since your table doesn’t have it
});


export default User;
