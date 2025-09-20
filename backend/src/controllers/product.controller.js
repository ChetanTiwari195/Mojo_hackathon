import Product from "../models/product.model.js";
import Category from "../models/category.model.js";

// Helper function to fetch HSN code (Corrected)
const fetchHsnCode = async (productName, productType) => {
  const query = productName.split(" ")[0];
  // Set category to 'P' for goods or 'S' for services
  const category = productType === "goods" ? "P" : "S";

  try {
    const response = await fetch(
      // Use the corrected URL structure with 'byDesc' and the correct category
      `https://services.gst.gov.in/commonservices/hsn/search/qsearch?inputText=${query}&selectedType=byDesc&category=${category}`
    );
    if (!response.ok) {
      console.error("Failed to fetch HSN data. Status:", response.status);
      return null;
    }
    const data = await response.json();
    // The API response uses 'c' for the code, not 'hsn'
    return data?.data?.[0]?.c || null;
  } catch (error) {
    console.error("Error fetching HSN code:", error);
    return null;
  }
};

// Create a new product
export const createProduct = async (req, res) => {
  try {
    const { productName, productType, categoryId, salesPrice, purchasePrice } =
      req.body;

    if (!productName || !categoryId || !salesPrice || !purchasePrice) {
      return res
        .status(400)
        .json({ error: "Required product fields are missing." });
    }

    // Pass the productType to the fetch function
    const hsnCode = await fetchHsnCode(productName, productType);

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
