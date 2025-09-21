import { Router } from "express";
import { getLedger } from "../controllers/ledger.controller.js";

const router = Router();

// Define the route to get the partner ledger
router.route("/").get(getLedger);

export default router;
