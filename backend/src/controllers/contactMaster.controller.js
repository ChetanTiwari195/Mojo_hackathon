import ContactMaster from "../models/contactMaster.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";

// Create a new contact
export const createContact = async (req, res) => {
  try {
    // Multer has now parsed the form, so req.body is available!
    const { contactName, email, phone, city, state, pincode, type } = req.body;

    if (!contactName || !email || !type) {
      return res
        .status(400)
        .json({ error: "Contact Name, Email, and Type are required." });
    }

    // The uploaded file's information is in req.file
    const profileImagePath = req.file?.path;

    const newContact = await ContactMaster.create({
      contactName,
      email,
      phone,
      city,
      state,
      pincode,
      type,
      profileImage: profileImagePath, // Save the file path to the database
    });

    res
      .status(201)
      .json({ message: "Contact created successfully!", data: newContact });
  } catch (error) {
    res
      .status(500)
      .json({ error: "Failed to create contact.", details: error.message });
  }
};

// Get all contacts, with optional filtering by type
export const getAllContacts = async (req, res) => {
  try {
    const { type } = req.query; // e.g., /api/v1/contacts?type=vendor
    const whereClause = {};

    if (type === "vendor") {
      whereClause.type = ["vendor", "both"];
    } else if (type) {
      whereClause.type = type;
    }

    const contacts = await ContactMaster.findAll({ where: whereClause });
    res.status(200).json({ data: contacts });
  } catch (error) {
    res
      .status(500)
      .json({ error: "Failed to fetch contacts.", details: error.message });
  }
};

// NEW: Get a specific contact by ID
export const getContactById = async (req, res) => {
  try {
    const { id } = req.params; // Get the ID from the URL parameters
    const contact = await ContactMaster.findByPk(id);

    if (!contact) {
      return res.status(404).json({ error: "Contact not found." });
    }

    res.status(200).json({ data: contact });
  } catch (error) {
    res
      .status(500)
      .json({ error: "Failed to fetch contact.", details: error.message });
  }
};

// NEW: Update a contact by ID
export const updateContact = asyncHandler(async (req, res) => {
  const { contactId } = req.params;
  const { contactName, email, phone, type, address, city, state, pincode } =
    req.body;

  // 1. Find the existing contact to get the old image path
  const contact = await Contact.findById(contactId);

  if (!contact) {
    throw new ApiError(404, "Contact not found");
  }

  const oldImagePath = contact.image; // Assuming 'image' stores the file path

  // 2. Determine the new image path
  // If a new file is uploaded, its path will be in req.file.path
  // If not, we keep the old image path.
  const newImagePath = req.file ? req.file.path : oldImagePath;

  // 3. Update the contact in the database with new text fields and the new image path
  const updatedContact = await Contact.findByIdAndUpdate(
    contactId,
    {
      $set: {
        contactName,
        email,
        phone,
        type,
        address,
        city,
        state,
        pincode,
        image: newImagePath,
      },
    },
    { new: true } // Return the updated document
  );

  // 4. If a new image was uploaded AND there was an old image, delete the old one
  if (req.file && oldImagePath) {
    fs.unlink(oldImagePath, (err) => {
      if (err) {
        console.error("Error deleting old image:", err);
      } else {
        console.log("Successfully deleted old image:", oldImagePath);
      }
    });
  }

  return res
    .status(200)
    .json(new ApiResponse(200, updatedContact, "Contact updated successfully"));
});
