import { Router } from "express";
import {
  createCategory,
  getAllCategories,
} from "../controllers/category.controller.js";

const router = Router();

router.route("/").post(createCategory).get(getAllCategories);

export default router;
