import { Router } from "express";
import purchaseOrderRouter from "./purchaseOrder.routes.js";
import contactMasterRouter from "./contactMaster.routes.js";
import productRouter from "./product.routes.js";
import taxRouter from "./tax.routes.js";
import categoryRouter from "./category.routes.js";
import accountRouter from "./account.routes.js";
import vendorBillRouter from "./vendorBill.routes.js";
import vendorPaymentRouter from "./vendorPayment.routes.js";
import salesRouter from "./sales.routes.js";
import ledgerRouter from "./ledger.routes.js";
import { getBalanceSheet } from "../controllers/balanceSheet.controller.js"; // Correct import, removing the duplicate.
import { getDashboardSummary } from "../controllers/dashboard.controller.js";

import {
  userRegister,
  userLogin,
  updateUser,
  getAllUsers,
  getUserById,
  getUserProfile,
} from "../controllers/user.controller.js";
import { authMiddleware } from "../middleware/authMiddleware.js";

const router = Router();

// --- Main Application Routers ---
// Using .use() for modular routers to handle all sub-routes.
router.use("/accounts", accountRouter);
router.use("/categories", categoryRouter);
router.use("/contacts", contactMasterRouter);
router.use("/products", productRouter);
router.use("/taxes", taxRouter);
router.use("/purchase-orders", purchaseOrderRouter);
router.use("/sales", salesRouter);
router.use("/vendor-bills", vendorBillRouter);
router.use("/vendor-payments", vendorPaymentRouter);
router.use("/ledger", ledgerRouter); // Using the dedicated ledger router.

// --- Single-Route Controllers ---
// These are routes handled directly within this file.
router.get("/balance-sheet", getBalanceSheet);
router.get("/dashboard-summary", getDashboardSummary);

// --- User Authentication Routes ---
router.post("/register", userRegister);
router.post("/login", userLogin);
router.get("/profile", authMiddleware, getUserProfile);
router.put("/update/:id", updateUser);
router.get("/getAllUsers", getAllUsers);
router.get("/getUser/:id", getUserById);

export default router;
