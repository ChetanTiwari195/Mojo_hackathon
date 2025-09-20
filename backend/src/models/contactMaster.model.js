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
    unique: {
      name: "unique_email_constraint", // Give the unique constraint a specific name
      msg: "This email is already in use.",
    },
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
    type: DataTypes.STRING,
    allowNull: true,
  },
  type: {
    type: DataTypes.ENUM("customer", "vendor", "both"),
    allowNull: false,
    defaultValue: "customer",
  },
});

export default ContactMaster;
