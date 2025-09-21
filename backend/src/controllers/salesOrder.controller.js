import { sequelize } from "../db/index.js";
import SalesOrder from "../models/salesOrder.model.js";
import SalesOrderLine from "../models/salesOrderLine.model.js";
import Product from "../models/product.model.js";
import Tax from "../models/tax.model.js";

// Helper function to generate the next SO number (e.g., SO00001 -> SO00002)
const getNextSoNumber = async () => {
  const lastOrder = await SalesOrder.findOne({
    order: [["poNumber", "DESC"]],
  });

  if (!lastOrder) return "SO00001";

  const lastNum = parseInt(lastOrder.poNumber.substring(2));
  return "SO" + String(lastNum + 1).padStart(5, "0");
};

/**
 * Retrieves a single Sales Order by its ID, including all line items and product details.
 * @param {object} req - The request object.
 * @param {object} res - The response object.
 */
export const getSalesOrderById = async (req, res) => {
  try {
    const { id } = req.params;
    const salesOrder = await SalesOrder.findByPk(id, {
      include: [
        {
          model: SalesOrderLine,
          as: "lines",
          include: [{ model: Product }], // Include product details like name and HSN code
        },
        // Include other related models if needed, e.g., ContactMaster
      ],
    });

    if (!salesOrder) {
      return res.status(404).json({ error: "Sales Order not found." });
    }

    res.status(200).json({ data: salesOrder });
  } catch (error) {
    res
      .status(500)
      .json({
        error: "Failed to fetch sales order.",
        details: error.message,
      });
  }
};

/**
 * Creates a new Sales Order along with its line items within a transaction.
 * @param {object} req - The request object containing order and line item data.
 * @param {object} res - The response object.
 */
export const createSalesOrder = async (req, res) => {
  const transaction = await sequelize.transaction();

  try {
    // Destructure the request body for required fields
    const { contactId, reference, poDate, lines } = req.body;

    // Validate that required fields are present and correctly formatted
    if (!contactId || !lines || !Array.isArray(lines) || lines.length === 0) {
      return res
        .status(400)
        .json({ error: "Missing required fields: contactId and lines array." });
    }

    // 1. Generate a new, unique sales order number
    const soNumber = await getNextSoNumber();

    // 2. Create the main Sales Order record
    const newSalesOrder = await SalesOrder.create(
      {
        contactId,
        reference,
        poDate,
        poNumber: soNumber, // Use poNumber field for consistency with model
      },
      { transaction }
    );

    let grandTotal = 0;

    // 3. Process each line item, perform calculations securely on the backend
    for (const line of lines) {
      const { productId, quantity, unitPrice, taxId } = line;

      // NOTE: For a real-world app, you should fetch the tax rate from the database
      const tax = await Tax.findByPk(taxId);
      if (!tax) throw new Error(`Tax with ID ${taxId} not found.`);
      const taxRate = tax.rate / 100;

      const untaxedAmount = Number(quantity) * Number(unitPrice);
      const taxAmount = untaxedAmount * taxRate;
      const total = untaxedAmount + taxAmount;

      grandTotal += total;

      // 4. Create the sales order line record
      await SalesOrderLine.create(
        {
          salesOrderId: newSalesOrder.id,
          productId,
          quantity,
          unitPrice,
          taxId,
          untaxedAmount,
          taxAmount,
          total,
        },
        { transaction }
      );
    }

    // 5. Update the main sales order with the final calculated total
    newSalesOrder.totalAmount = grandTotal;
    await newSalesOrder.save({ transaction });

    // 6. If all steps succeeded, commit the transaction
    await transaction.commit();

    res.status(201).json({
      message: "Sales Order created successfully!",
      data: newSalesOrder,
    });
  } catch (error) {
    // If any step fails, roll back the entire transaction
    await transaction.rollback();
    console.error("Failed to create sales order:", error);
    res.status(500).json({
      error: "Failed to create sales order.",
      details: error.message,
    });
  }
};
