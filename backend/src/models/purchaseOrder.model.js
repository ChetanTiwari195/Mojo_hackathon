import { DataTypes } from "sequelize";
import { sequelize } from "../db/index.js";
import ContactMaster from "./contactMaster.model.js"; // Import ContactMaster instead of Vendor

const PurchaseOrder = sequelize.define("PurchaseOrder", {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  poNumber: {
    type: DataTypes.STRING,
    // unique: true,
    // allowNull: false,
  },
  poDate: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
  reference: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  totalAmount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    defaultValue: 0.0,
  },
  status: {
    type: DataTypes.ENUM("draft", "confirmed", "cancelled"),
    defaultValue: "draft",
  },
  // Foreign key is now contactId, referencing the ContactMasters table
  contactId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: "ContactMasters", // The name of the new table
      key: "id",
    },
  },
});

// Define the new Relationship
ContactMaster.hasMany(PurchaseOrder, { foreignKey: "contactId" });
PurchaseOrder.belongsTo(ContactMaster, { foreignKey: "contactId" });

export default PurchaseOrder;
