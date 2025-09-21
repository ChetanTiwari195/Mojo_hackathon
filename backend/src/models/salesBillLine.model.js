import { DataTypes } from "sequelize";
import { sequelize } from "../db/index.js";

const SalesBillLine = sequelize.define("SalesBillLine", {
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
  salesBillId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: "SalesBills",
      key: "id",
    },
  },
  productId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: "Products",
      key: "id",
    },
  },
  taxId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: "Taxes",
      key: "id",
    },
  },
  accountId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: "Accounts",
      key: "id",
    },
  },
});

export default SalesBillLine;
