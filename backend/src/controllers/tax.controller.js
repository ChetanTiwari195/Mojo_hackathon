import Tax from "../models/tax.model.js";

// Create a new tax
export const createTax = async (req, res) => {
  try {
    const { taxName, computationMethod, taxScope, value } = req.body;

    if (!taxName || !computationMethod || !value) {
      return res
        .status(400)
        .json({
          error: "Tax Name, Computation Method, and Value are required.",
        });
    }

    const newTax = await Tax.create(req.body);
    res
      .status(201)
      .json({ message: "Tax created successfully!", data: newTax });
  } catch (error) {
    res
      .status(500)
      .json({ error: "Failed to create tax.", details: error.message });
  }
};

// Get all taxes, with optional filtering by scope
export const getAllTaxes = async (req, res) => {
  try {
    const { scope } = req.query; // e.g., /api/v1/taxes?scope=sales
    const whereClause = {};

    if (scope === "sales") {
      whereClause.taxScope = ["sales", "both"];
    } else if (scope === "purchase") {
      whereClause.taxScope = ["purchase", "both"];
    }

    const taxes = await Tax.findAll({ where: whereClause });
    res.status(200).json({ data: taxes });
  } catch (error) {
    res
      .status(500)
      .json({ error: "Failed to fetch taxes.", details: error.message });
  }
};

// NEW: Get a specific tax by its ID
export const getTaxById = async (req, res) => {
  try {
    const { id } = req.params;
    const tax = await Tax.findByPk(id);

    if (!tax) {
      return res.status(404).json({ error: "Tax not found." });
    }

    res.status(200).json({ data: tax });
  } catch (error) {
    res
      .status(500)
      .json({ error: "Failed to fetch tax.", details: error.message });
  }
};

// NEW: Update an existing tax
export const updateTax = async (req, res) => {
  try {
    const { id } = req.params;
    const tax = await Tax.findByPk(id);

    if (!tax) {
      return res.status(404).json({ error: "Tax not found." });
    }

    // Update the instance with new data from the request body
    const updatedTax = await tax.update(req.body);

    res
      .status(200)
      .json({ message: "Tax updated successfully!", data: updatedTax });
  } catch (error) {
    res
      .status(500)
      .json({ error: "Failed to update tax.", details: error.message });
  }
};