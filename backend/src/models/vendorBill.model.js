import { DataTypes } from "sequelize";
import { sequelize } from "../db/index.js";
import ContactMaster from "./contactMaster.model.js";
import PurchaseOrder from "./purchaseOrder.model.js";

const VendorBill = sequelize.define("VendorBill", {
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
    type: DataTypes.DATE,
    allowNull: false,
  },
  dueDate: {
    type: DataTypes.DATE,
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
  purchaseOrderId: {
    type: DataTypes.INTEGER,
    allowNull: true, // A bill might not always come from a PO
    references: {
      model: "PurchaseOrders",
      key: "id",
    },
  },
});

// Relationships
ContactMaster.hasMany(VendorBill, { foreignKey: "contactId" });
VendorBill.belongsTo(ContactMaster, { foreignKey: "contactId" });

PurchaseOrder.hasOne(VendorBill, { foreignKey: "purchaseOrderId" });
VendorBill.belongsTo(PurchaseOrder, { foreignKey: "purchaseOrderId" });

export default VendorBill;
