import express from "express";
import {
  createContact,
  getAllContacts,
  getContactById,
  updateContact,
} from "../controllers/contactMaster.controller.js";
import { upload } from "../middleware/multer.middleware.js";

const router = express.Router();

router.route("/").get(getAllContacts).post(upload.single("image"), createContact);

// MODIFIED: Added the multer middleware to the PUT route
router
  .route("/:id")
  .get(getContactById)
  .put(upload.single("image"), updateContact); // <-- ADD MIDDLEWARE HERE

export default router;