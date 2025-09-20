import { Router } from "express";
import purchaseOrderRouter from "./purchaseOrder.routes.js";
import contactMasterRouter from "./contactMaster.routes.js";
import productRouter from "./product.routes.js";
import taxRouter from "./tax.routes.js";
import categoryRouter from "./category.routes.js";
import { userRegister, userLogin } from "../controllers/user.controller.js"; // 1. Import the new router

const router = Router();

// 2. Register all routes
router.use("/categories", categoryRouter); // Add this line
router.use("/contacts", contactMasterRouter);
router.use("/products", productRouter);
router.use("/taxes", taxRouter);
router.use("/purchase-orders", purchaseOrderRouter);
router.route("/register").post(userRegister);
router.route("/login").post(userLogin);
export default router;
