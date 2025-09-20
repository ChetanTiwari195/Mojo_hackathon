import Product from "../models/product.model.js";
import Category from "../models/category.model.js";

// Helper function to fetch HSN code
const fetchHsnCode = async (productName, productType) => {
  const query = productName.split(" ")[0];
  // Set category to 'P' for goods or 'S' for services
  const category = productType === "goods" ? "P" : "S";

  try {
    const response = await fetch(
      `https://services.gst.gov.in/commonservices/hsn/search/qsearch?inputText=${query}&selectedType=byDesc&category=${category}`
    );
    if (!response.ok) {
      console.error("Failed to fetch HSN data. Status:", response.status);
      return null;
    }
    const data = await response.json();
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

// Get a single product by ID
export const getProductById = async (req, res) => {
  try {
    const { id } = req.params;

    const product = await Product.findByPk(id, {
      include: [{ model: Category, as: "category" }],
    });

    if (!product) {
      return res.status(404).json({ error: "Product not found." });
    }

    res.status(200).json({ data: product });
  } catch (error) {
    res
      .status(500)
      .json({ error: "Failed to fetch product.", details: error.message });
  }
};

// Update a product
export const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const { productName, productType, categoryId, salesPrice, purchasePrice } =
      req.body;

    // Check if product exists
    const existingProduct = await Product.findByPk(id);
    if (!existingProduct) {
      return res.status(404).json({ error: "Product not found." });
    }

    // Validate required fields
    if (!productName || !categoryId || !salesPrice || !purchasePrice) {
      return res
        .status(400)
        .json({ error: "Required product fields are missing." });
    }

    // Fetch new HSN code if product name or type changed
    let hsnCode = existingProduct.hsnCode;
    if (
      productName !== existingProduct.productName ||
      productType !== existingProduct.productType
    ) {
      const newHsnCode = await fetchHsnCode(productName, productType);
      // Only update HSN code if we successfully fetched a new one
      if (newHsnCode) {
        hsnCode = newHsnCode;
      }
      // If fetchHsnCode returns null, keep the existing HSN code
    }

    // Update the product
    await existingProduct.update({
      ...req.body,
      hsnCode,
    });

    // Fetch updated product with category
    const updatedProduct = await Product.findByPk(id, {
      include: [{ model: Category, as: "category" }],
    });

    res.status(200).json({
      message: "Product updated successfully!",
      data: updatedProduct,
    });
  } catch (error) {
    res
      .status(500)
      .json({ error: "Failed to update product.", details: error.message });
  }
};

// Delete a product
export const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;

    const product = await Product.findByPk(id);
    if (!product) {
      return res.status(404).json({ error: "Product not found." });
    }

    await product.destroy();

    res.status(200).json({ message: "Product deleted successfully!" });
  } catch (error) {
    res
      .status(500)
      .json({ error: "Failed to delete product.", details: error.message });
  }
};
