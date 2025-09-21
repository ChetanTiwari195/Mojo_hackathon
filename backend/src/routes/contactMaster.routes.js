import express from "express";
import {
  createContact,
  getAllContacts,
  getContactById,
  updateContact,
  getContactNames, // 1. Import the new function
} from "../controllers/contactMaster.controller.js";
import { upload } from "../middleware/multer.middleware.js";

const router = express.Router();

// 2. Add the new route
router.route("/names").get(getContactNames);

router
  .route("/")
  .get(getAllContacts)
  .post(upload.single("image"), createContact);

router
  .route("/:id")
  .get(getContactById)
  .put(upload.single("image"), updateContact);

export default router;
