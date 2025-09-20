import Category from "../models/category.model.js";

// Create a new category
export const createCategory = async (req, res) => {
  try {
    const { name } = req.body;
    if (!name) {
      return res.status(400).json({ error: "Category name is required." });
    }
    const newCategory = await Category.create({ name });
    res
      .status(201)
      .json({ message: "Category created successfully!", data: newCategory });
  } catch (error) {
    res
      .status(500)
      .json({ error: "Failed to create category.", details: error.message });
  }
};

// Get all categories
export const getAllCategories = async (req, res) => {
  try {
    const categories = await Category.findAll();
    res.status(200).json({ data: categories });
  } catch (error) {
    res
      .status(500)
      .json({ error: "Failed to fetch categories.", details: error.message });
  }
};
