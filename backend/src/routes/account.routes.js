import { Router } from "express";
import {
  createAccount,
  getAllAccounts,
  deleteAccount,
} from "../controllers/account.controller.js";

const router = Router();

router.route("/").post(createAccount).get(getAllAccounts);
router.route("/:id").delete(deleteAccount);

export default router;
