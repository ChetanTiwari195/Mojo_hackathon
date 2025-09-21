import express from "express";
import {
  createSalesOrder,
  getSalesOrderById,
} from "../controllers/salesOrder.controller.js";
import { createSalesBill } from "../controllers/salesBill.controller.js";
import { createSalesPayment } from "../controllers/salesPayment.controller.js";

const salesRouter = express.Router();

// Sales Order Routes
salesRouter.post("/orders", createSalesOrder);
salesRouter.get("/orders/:id", getSalesOrderById);

// Sales Bill (Invoice) Routes
salesRouter.post("/bills", createSalesBill);

// Sales Payment (Receipt) Routes
salesRouter.post("/payments", createSalesPayment);

export default salesRouter;

// To use this router, you would typically add it to your main Express app,
// for example, in app.js:
// import salesRouter from './routes/sales.routes.js';
// app.use('/api/v1/sales', salesRouter);
