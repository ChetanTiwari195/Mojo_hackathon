import { Router } from "express";
import {
  createSalesOrder,
  getAllSalesOrders,
  getSalesOrderById,
  updateSalesOrder,
  deleteSalesOrder,
} from "../controllers/sales.controller.js";

const router = Router();

// Route for creating a new sales order and getting all sales orders
router.route("/").post(createSalesOrder).get(getAllSalesOrders);

// Routes for getting, updating, and deleting a single sales order by its ID
router
  .route("/:id")
  .get(getSalesOrderById)
  .put(updateSalesOrder)
  .delete(deleteSalesOrder);

export default router;
