import express from "express";
import { getBalanceSheet } from "../controllers/balance-sheet.controller.js";

const router = express.Router();

/**
 * @route GET /api/v1/balance-sheet
 * @description Get balance sheet data
 * @access Public (you may want to add authentication middleware)
 */
router.get("/", getBalanceSheet);

export default router;
