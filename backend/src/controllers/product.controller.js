import Product from "../models/product.model.js";
import Category from "../models/category.model.js";

// Helper function to fetch HSN code (no changes here)
const fetchHsnCode = async (productName) => {
  const query = productName.split(" ")[0];
  try {
    const response = await fetch(
      `https://services.gst.gov.in/commonservices/hsn/search/qsearch?inputText=${query}&selectedType=byCode&category=null`
    );
    if (!response.ok) {
      console.error("Failed to fetch HSN data. Status:", response.status);
      return null;
    }
    const data = await response.json();
    return data?.data?.[0]?.hsn || null;
  } catch (error) {
    console.error("Error fetching HSN code:", error);
    return null;
  }
};

// Create a new product (no changes here, it correctly uses ...req.body)
export const createProduct = async (req, res) => {
  try {
    const { productName, categoryId, salesPrice, purchasePrice } = req.body;

    if (!productName || !categoryId || !salesPrice || !purchasePrice) {
      return res
        .status(400)
        .json({ error: "Required product fields are missing." });
    }

    const hsnCode = await fetchHsnCode(productName);

    const newProduct = await Product.create({
      ...req.body,
      hsnCode,
    });

    res
      .status(201)
      .json({ message: "Product created successfully!", data: newProduct });
  } catch (error) {
    res
      .status(500)
      .json({ error: "Failed to create product.", details: error.message });
  }
};

// Get all products, including their Category details
export const getAllProducts = async (req, res) => {
  try {
    // The `include` for Tax has been removed.
    const products = await Product.findAll({
      include: [{ model: Category, as: "category" }],
    });
    res.status(200).json({ data: products });
  } catch (error) {
    res
      .status(500)
      .json({ error: "Failed to fetch products.", details: error.message });
  }
};
