import dotenv from "dotenv";
import { sequelize, connectDB } from "./src/db/index.js";
import app from "./app.js";

// === IMPORT ALL MODELS HERE ===
import Account from "./src/models/account.model.js"; // ADD THIS
import ContactMaster from "./src/models/contactMaster.model.js";
import Category from "./src/models/category.model.js";
import Tax from "./src/models/tax.model.js";
import Product from "./src/models/product.model.js";
import PurchaseOrder from "./src/models/purchaseOrder.model.js";
import PurchaseOrderLine from "./src/models/purchaseOrderLine.model.js";
import VendorBill from "./src/models/vendorBill.model.js"; // ADD THIS
import VendorBillLine from "./src/models/vendorBillLine.model.js"; // ADD THIS
import VendorPayment from "./src/models/vendorPayment.model.js"; // ADD THIS

dotenv.config();

connectDB()
  .then(() => {
    sequelize
      .sync({ alter: true }) // This will now create the 'Accounts' table
      .then(() => {
        console.log("✅ All models were synchronized successfully.");

        app.listen(process.env.PORT || 8000, () => {
          console.log(`✅ Server is running at port: ${process.env.PORT}`);
        });
      })
      .catch((err) => {
        console.error("❌ Failed to sync database models: ", err);
      });
  })
  .catch((err) => {
    console.log("❌ MySQL connection failed!!! ", err);
  });
