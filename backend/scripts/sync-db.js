// backend/scripts/sync-db.js

import { sequelize } from "../src/db/index.js";
import "../src/models/account.model.js";
import "../src/models/contactMaster.model.js";
import "../src/models/category.model.js";
import "../src/models/tax.model.js";
import "../src/models/product.model.js";
import "../src/models/purchaseOrder.model.js";
import "../src/models/purchaseOrderLine.model.js";
import "../src/models/vendorBill.model.js";
import "../src/models/vendorBillLine.model.js";
import "../src/models/vendorPayment.model.js";

const syncDatabase = async () => {
  try {
    await sequelize.sync({ alter: true });
    console.log("✅ All models were synchronized successfully!");
  } catch (error) {
    console.error("❌ Failed to sync database models: ", error);
  } finally {
    await sequelize.close();
  }
};

syncDatabase();
