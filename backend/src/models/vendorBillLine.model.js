import { DataTypes } from "sequelize";
import { sequelize } from "../db/index.js";
import VendorBill from "./vendorBill.model.js";
import Product from "./product.model.js";
import Tax from "./tax.model.js";
import Account from "./account.model.js";

const VendorBillLine = sequelize.define("VendorBillLine", {
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
  vendorBillId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: "VendorBills",
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

// Relationships
VendorBill.hasMany(VendorBillLine, { foreignKey: "vendorBillId", as: "lines" });
VendorBillLine.belongsTo(VendorBill, { foreignKey: "vendorBillId" });

Product.hasMany(VendorBillLine, { foreignKey: "productId" });
VendorBillLine.belongsTo(Product, { foreignKey: "productId" });

Account.hasMany(VendorBillLine, { foreignKey: "accountId" });
VendorBillLine.belongsTo(Account, { foreignKey: "accountId" });

export default VendorBillLine;
