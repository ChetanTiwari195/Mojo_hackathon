import { Router } from "express";
import purchaseOrderRouter from "./purchaseOrder.routes.js";
import contactMasterRouter from "./contactMaster.routes.js";
import productRouter from "./product.routes.js";
import taxRouter from "./tax.routes.js";
import categoryRouter from "./category.routes.js";
import accountRouter from "./account.routes.js"; // 1. Import the new router
import vendorBillRouter from "./vendorBill.routes.js"; // 1. Import
import vendorPaymentRouter from "./vendorPayment.routes.js"; // 1. Import
import salesRouter from "./sales.routes.js";

import {
  userRegister,
  userLogin,
  updateUser,
  getAllUsers,
  getUserById,
  getUserProfile,
} from "../controllers/user.controller.js";
import { authMiddleware } from "../middleware/authMiddleware.js";
import { getLedger } from "../controllers/ledger.controller.js";
import ledgerRouter from "./ledger.routes.js";

import balanceSheetRouter from "./balance-sheet.routes.js";
import { getBalanceSheet } from "../controllers/balance-sheet.controller.js";

const router = Router();

// 2. Register
router.use("/vendor-payments", vendorPaymentRouter); // Add this line
router.use("/accounts", accountRouter);
router.use("/categories", categoryRouter);
router.use("/contacts", contactMasterRouter);
router.use("/products", productRouter);
router.use("/taxes", taxRouter);
router.use("/purchase-orders", purchaseOrderRouter);
router.use("/sales", salesRouter);

router.use("/vendor-bills", vendorBillRouter);
router.get("/ledger", getLedger);

//User Routes
router.post("/register", userRegister);
router.post("/login", userLogin);
router.get("/profile", authMiddleware, getUserProfile);
router.put("/update/:id", updateUser);
router.get("/getAllUsers", getAllUsers);
router.get("/getUser/:id", getUserById);
router.get("/ledger", ledgerRouter);
router.get("/balance-sheet", getBalanceSheet);

export default router;
