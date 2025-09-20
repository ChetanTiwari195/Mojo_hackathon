import { Router } from "express";
import { createVendorPayment } from "../controllers/vendorPayment.controller.js";

const router = Router();

router.route("/").post(createVendorPayment);

export default router;
