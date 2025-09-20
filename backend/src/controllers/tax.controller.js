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

// Get all taxes, with optional filtering by scope (for dropdowns)
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
