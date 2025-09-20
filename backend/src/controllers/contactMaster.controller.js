import ContactMaster from "../models/contactMaster.model.js";

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
export const updateContact = async (req, res) => {
  try {
    const { id } = req.params; // Get the ID from the URL parameters

    // First, find the contact to ensure it exists
    const contact = await ContactMaster.findByPk(id);

    if (!contact) {
      return res.status(404).json({ error: "Contact not found." });
    }

    // Update the contact with data from the request body
    const updatedContact = await contact.update(req.body);

    res
      .status(200)
      .json({ message: "Contact updated successfully!", data: updatedContact });
  } catch (error) {
    res
      .status(500)
      .json({ error: "Failed to update contact.", details: error.message });
  }
};