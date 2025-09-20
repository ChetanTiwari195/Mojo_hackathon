import { DataTypes } from "sequelize";
import { sequelize } from "../db/index.js";
import ContactMaster from "./contactMaster.model.js";
import VendorBill from "./vendorBill.model.js";
import Account from "./account.model.js";

const VendorPayment = sequelize.define("VendorPayment", {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  paymentNumber: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  paymentType: {
    type: DataTypes.ENUM("send", "receive"),
    allowNull: false,
  },
  amount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
  },
  paymentDate: {
    type: DataTypes.DATE,
    allowNull: false,
  },
  note: {
    type: DataTypes.TEXT,
    allowNull: true,
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
  vendorBillId: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: "VendorBills",
      key: "id",
    },
  },
  // This is the 'Payment Via' account (e.g., Cash or Bank)
  journalId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: "Accounts",
      key: "id",
    },
  },
});

// Relationships
VendorPayment.belongsTo(ContactMaster, { foreignKey: "contactId" });
VendorPayment.belongsTo(VendorBill, { foreignKey: "vendorBillId" });
VendorPayment.belongsTo(Account, { as: "journal", foreignKey: "journalId" });

export default VendorPayment;
