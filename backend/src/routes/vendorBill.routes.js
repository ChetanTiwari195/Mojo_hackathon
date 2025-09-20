import { Router } from "express";
import { createVendorBill } from "../controllers/vendorBill.controller.js";

const router = Router();

router.route("/").post(createVendorBill);
// Add GET routes here later if needed

export default router;
