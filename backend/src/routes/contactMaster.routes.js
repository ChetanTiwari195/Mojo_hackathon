import { Router } from "express";
import {
  createContact,
  getAllContacts,
} from "../controllers/contactMaster.controller.js";

const router = Router();

router.route("/").post(createContact).get(getAllContacts);

export default router;
