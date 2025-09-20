import { Router } from "express";
import { createTax, getAllTaxes } from "../controllers/tax.controller.js";

const router = Router();

router.route("/").post(createTax).get(getAllTaxes);

export default router;
