import { sequelize } from "../db/index.js";
import PurchaseOrder from "../models/purchaseOrder.model.js";
import PurchaseOrderLine from "../models/purchaseOrderLine.model.js";
// You will need to create and import your Tax model
// import Tax from '../models/tax.model.js';

// Helper function to generate the next PO number (e.g., P00001 -> P00002)
const getNextPoNumber = async () => {
  const lastOrder = await PurchaseOrder.findOne({
    order: [["poNumber", "DESC"]],
  });

  if (!lastOrder) return "P00001";

  const lastNum = parseInt(lastOrder.poNumber.substring(2));
  return "PO" + String(lastNum + 1).padStart(5, "0");
};

// Add this function to the existing file

export const getPurchaseOrderById = async (req, res) => {
  try {
    const { id } = req.params;
    const purchaseOrder = await PurchaseOrder.findByPk(id, {
      include: [
        {
          model: PurchaseOrderLine,
          as: "lines",
          include: [{ model: Product }], // Include product details like HSN code
        },
        // Add includes for ContactMaster, etc. if needed
      ],
    });

    if (!purchaseOrder) {
      return res.status(404).json({ error: "Purchase Order not found." });
    }

    res.status(200).json({ data: purchaseOrder });
  } catch (error) {
    res
      .status(500)
      .json({
        error: "Failed to fetch purchase order.",
        details: error.message,
      });
  }
};

export const createPurchaseOrder = async (req, res) => {
  const transaction = await sequelize.transaction();

  try {
    // Change the body destructuring to look for contactId
    const { contactId, reference, poDate, lines } = req.body;

    // Change the validation
    if (!contactId || !lines || !Array.isArray(lines) || lines.length === 0) {
      return res
        .status(400)
        .json({ error: "Missing required fields: contactId and lines array." });
    }

    // 1. Create the main Purchase Order record first
    const poNumber = await getNextPoNumber();
    // Change the create call
    const newPurchaseOrder = await PurchaseOrder.create(
      {
        contactId, // Use contactId
        reference,
        poDate,
        poNumber,
      },
      { transaction }
    );

    let grandTotal = 0;

    // 2. Process each line item
    for (const line of lines) {
      const { productId, quantity, unitPrice, taxId } = line;

      // !! IMPORTANT: Fetch the tax rate from your database
      // This prevents the client from sending a fake tax rate.
      // const tax = await Tax.findByPk(taxId);
      // if (!tax) throw new Error(`Tax with ID ${taxId} not found.`);
      // const taxRate = tax.rate / 100; // Example: 5% is stored as 5, so 5 / 100 = 0.05

      // For demonstration, using hardcoded tax rates based on your image
      const taxRate = taxId === 1 ? 0.05 : 0.1; // 5% or 10%

      // Perform calculations securely on the backend
      const untaxedAmount = Number(quantity) * Number(unitPrice);
      const taxAmount = untaxedAmount * taxRate;
      const total = untaxedAmount + taxAmount;

      grandTotal += total;

      // Create the purchase order line record
      await PurchaseOrderLine.create(
        {
          purchaseOrderId: newPurchaseOrder.id,
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

    // 3. Update the main PO with the final calculated total
    newPurchaseOrder.totalAmount = grandTotal;
    await newPurchaseOrder.save({ transaction });

    // If everything worked, commit the transaction
    await transaction.commit();

    res.status(201).json({
      message: "Purchase Order created successfully!",
      data: newPurchaseOrder,
    });
  } catch (error) {
    // If any step fails, roll back the entire transaction
    await transaction.rollback();
    console.error("Failed to create purchase order:", error);
    res.status(500).json({
      error: "Failed to create purchase order.",
      details: error.message,
    });
  }
};
