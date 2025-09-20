import ContactMaster from "../models/contactMaster.model.js";

// Create a new contact
export const createContact = async (req, res) => {
  try {
    const { contactName, email, phone, city, state, pincode, type } = req.body;

    if (!contactName || !email || !type) {
      return res
        .status(400)
        .json({ error: "Contact Name, Email, and Type are required." });
    }

    const newContact = await ContactMaster.create(req.body);
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
