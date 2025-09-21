import { DataTypes } from "sequelize";
import { sequelize } from "../db/index.js";

const SalesBill = sequelize.define("SalesBill", {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  billNumber: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  billDate: {
    type: DataTypes.DATEONLY,
    allowNull: false,
  },
  dueDate: {
    type: DataTypes.DATEONLY,
    allowNull: false,
  },
  billReference: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  totalAmount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    defaultValue: 0.0,
  },
  status: {
    type: DataTypes.ENUM("draft", "posted", "paid", "cancelled"),
    defaultValue: "draft",
  },
  // Foreign Keys
  contactId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: "ContactMasters",
      key: "id",
    },
  },
  salesOrderId: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: "SalesOrders",
      key: "id",
    },
  },
});

export default SalesBill;
