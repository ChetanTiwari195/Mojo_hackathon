import { DataTypes } from "sequelize";
import { sequelize } from "../db/index.js";
import PurchaseOrder from "./purchaseOrder.model.js";

const PurchaseOrderLine = sequelize.define("PurchaseOrderLine", {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  quantity: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  unitPrice: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
  },
  // Calculated fields, stored for easy reporting
  untaxedAmount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
  },
  taxAmount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
  },
  total: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
  },
  // Foreign Keys
  purchaseOrderId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: "PurchaseOrders",
      key: "id",
    },
  },
  productId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: "Products", // Assumes you have a 'Products' table
      key: "id",
    },
  },
  taxId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: "Taxes", // Assumes you have a 'Taxes' table
      key: "id",
    },
  },
});

// Define the relationship
PurchaseOrder.hasMany(PurchaseOrderLine, {
  foreignKey: "purchaseOrderId",
  as: "lines",
});
PurchaseOrderLine.belongsTo(PurchaseOrder, { foreignKey: "purchaseOrderId" });

export default PurchaseOrderLine;
