import express from "express";
import {
  createContact,
  getAllContacts,
  getContactById,
  updateContact,
} from "../controllers/contactMaster.controller.js";
import { upload } from "../middleware/multer.middleware.js";

const router = express.Router();

// Existing route for getting all contacts
router.route("/").get(getAllContacts);

// 2. Apply the middleware to the POST route
// It will process one file attached to the 'image' field
router.route("/").post(upload.single("image"), createContact);

// Existing routes for specific contact
router.route("/:id").get(getContactById).put(updateContact); // You might want to add upload.single('image') to put() later

export default router;