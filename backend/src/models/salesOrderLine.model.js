import { DataTypes } from "sequelize";
import { sequelize } from "../db/index.js";
import SalesOrder from "./salesOrder.model.js";
import Product from "./product.model.js";
import Tax from "./tax.model.js";
import Account from "./account.model.js";

const SalesOrderLine = sequelize.define("SalesOrderLine", {
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
  // Corrected from PurchaseOrders to SalesOrders
  salesOrderId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: "SalesOrders",
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
SalesOrder.hasMany(SalesOrderLine, {
  foreignKey: "salesOrderId",
  as: "lines",
});
SalesOrderLine.belongsTo(SalesOrder, { foreignKey: "salesOrderId" });

// Added missing relationships
SalesOrderLine.belongsTo(Product, { foreignKey: "productId" });
SalesOrderLine.belongsTo(Tax, { foreignKey: "taxId" });

export default SalesOrderLine;
