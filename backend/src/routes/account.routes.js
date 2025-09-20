import { Router } from "express";
import {
  createAccount,
  getAllAccounts,
} from "../controllers/account.controller.js";

const router = Router();

router.route("/").post(createAccount).get(getAllAccounts);

export default router;
