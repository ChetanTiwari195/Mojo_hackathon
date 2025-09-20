import { Router } from "express";
import {
  createPurchaseOrder,
  getPurchaseOrderById,
} from "../controllers/purchaseOrder.controller.js";

const router = Router();

router.route("/").post(createPurchaseOrder);
router.route("/:id").get(getPurchaseOrderById); // Add this line

export default router;
