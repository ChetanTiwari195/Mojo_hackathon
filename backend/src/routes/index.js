import { Router } from "express";
import purchaseOrderRouter from "./purchaseOrder.routes.js";
import contactMasterRouter from "./contactMaster.routes.js";
import productRouter from "./product.routes.js";
import taxRouter from "./tax.routes.js";
import categoryRouter from "./category.routes.js"; // 1. Import the new router

const router = Router();

// 2. Register all routes
router.use("/categories", categoryRouter); // Add this line
router.use("/contacts", contactMasterRouter);
router.use("/products", productRouter);
router.use("/taxes", taxRouter);
router.use("/purchase-orders", purchaseOrderRouter);

export default router;
