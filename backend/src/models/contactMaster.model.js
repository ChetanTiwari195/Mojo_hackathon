import { DataTypes } from "sequelize";
import { sequelize } from "../db/index.js";

const ContactMaster = sequelize.define("ContactMaster", {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  contactName: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    validate: {
      isEmail: true,
    },
  },
  phone: {
    type: DataTypes.STRING,
  },
  city: {
    type: DataTypes.STRING,
  },
  state: {
    type: DataTypes.STRING,
  },
  pincode: {
    type: DataTypes.STRING,
  },
  profileImage: {
    type: DataTypes.STRING, // Will store the URL to the image
    allowNull: true,
  },
  type: {
    type: DataTypes.ENUM("customer", "vendor", "both"),
    allowNull: false,
    defaultValue: "customer",
  },
});

export default ContactMaster;
