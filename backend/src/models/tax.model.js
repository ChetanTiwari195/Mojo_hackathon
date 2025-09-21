import { DataTypes } from "sequelize";
import { sequelize } from "../db/index.js";

const Tax = sequelize.define("Tax", {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  taxName: {
    type: DataTypes.STRING,
    // allowNull: false,
    // unique: true, // e.g., "GST 5%", "Service Charge"
  },
  computationMethod: {
    type: DataTypes.ENUM("percentage", "fixed"),
    allowNull: false,
    defaultValue: "percentage",
  },
  taxScope: {
    type: DataTypes.ENUM("sales", "purchase", "both"),
    allowNull: false,
    defaultValue: "both",
    comment: "Determines if tax applies to sales, purchase, or both",
  },
  value: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    comment: "The percentage or fixed value of the tax",
  },
});

export default Tax;
