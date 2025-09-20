import express from "express";
import {
  createTax,
  getAllTaxes,
  getTaxById,   
  updateTax,    
} from "../controllers/tax.controller.js";

const router = express.Router();

// Routes for creating a new tax and getting all taxes
router.route("/")
  .post(createTax)
  .get(getAllTaxes);

// Routes for getting and updating a specific tax by its ID
router.route("/:id")
  .get(getTaxById)
  .put(updateTax);

export default router;