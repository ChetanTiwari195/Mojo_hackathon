import { Router } from "express";
import purchaseOrderRouter from "./purchaseOrder.routes.js";
import contactMasterRouter from "./contactMaster.routes.js";
import productRouter from "./product.routes.js";
import taxRouter from "./tax.routes.js";
import categoryRouter from "./category.routes.js";
import accountRouter from "./account.routes.js"; // 1. Import the new router
import vendorBillRouter from "./vendorBill.routes.js"; // 1. Import
import vendorPaymentRouter from "./vendorPayment.routes.js"; // 1. Import
import { userRegister, userLogin, updateUser, getAllUsers, getUserById } from "../controllers/user.controller.js";

const router = Router();

// 2. Register
router.use("/vendor-payments", vendorPaymentRouter); // Add this line
router.use("/accounts", accountRouter);
router.use("/categories", categoryRouter);
router.use("/contacts", contactMasterRouter);
router.use("/products", productRouter);
router.use("/taxes", taxRouter);
router.use("/purchase-orders", purchaseOrderRouter);
router.use("/vendor-bills", vendorBillRouter);

//User Routes
router.post("/register", userRegister);
router.post("/login", userLogin);
router.put("/update/:id",updateUser);
router.get("/getAllUsers",getAllUsers);
router.get("/getUser/:id",getUserById);
export default router;
