import dotenv from "dotenv";
import { sequelize, connectDB } from "./src/db/index.js";
import app from "./app.js";

// === IMPORT ALL MODELS HERE ===
import "./src/models/account.model.js";
import "./src/models/contactMaster.model.js";
import "./src/models/category.model.js";
import "./src/models/tax.model.js";
import "./src/models/product.model.js";
import "./src/models/purchaseOrder.model.js";
import "./src/models/purchaseOrderLine.model.js";
import "./src/models/vendorBill.model.js";
import "./src/models/vendorBillLine.model.js";
import "./src/models/vendorPayment.model.js";

dotenv.config();

connectDB()
  .then(() => {
    app.listen(process.env.PORT || 3001, () => {
      console.log(`✅ Server is running at port: ${process.env.PORT || 3001}`);
    });
  })
  .catch((err) => {
    console.log("❌ MySQL connection failed!!! ", err);
  });
