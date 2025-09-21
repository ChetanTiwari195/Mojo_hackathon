import { Router } from "express";
import {
  createProduct,
  getAllProducts,
  getProductById,
  updateProduct,
  deleteProduct,
  getProductListForOrder, // 1. Import the new function
} from "../controllers/product.controller.js";

const router = Router();

router.route("/list").get(getProductListForOrder); // 2. Add the new route

router.route("/").post(createProduct).get(getAllProducts);
router
  .route("/:id")
  .get(getProductById)
  .put(updateProduct)
  .delete(deleteProduct);

export default router;
