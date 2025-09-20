import { Router } from "express";
import { createPurchaseOrder } from "../controllers/purchaseOrder.controller.js";

const router = Router();

// Route to handle the "Create Bill" action
router.route("/").post(createPurchaseOrder);

// You can add other routes here later (e.g., GET to fetch orders)
// router.route('/').get(getAllPurchaseOrders);
// router.route('/:id').get(getPurchaseOrderById);

export default router;
