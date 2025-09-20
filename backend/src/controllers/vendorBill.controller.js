import { sequelize } from "../db/index.js";
import VendorBill from "../models/vendorBill.model.js";
import VendorBillLine from "../models/vendorBillLine.model.js";
import PurchaseOrder from "../models/purchaseOrder.model.js";
import PurchaseOrderLine from "../models/purchaseOrderLine.model.js";
import Product from "../models/product.model.js";

const getNextBillNumber = async () => {
  const lastBill = await VendorBill.findOne({
    order: [["billNumber", "DESC"]],
  });
  if (!lastBill) return "Bill/2025/0001";
  const lastNum = parseInt(lastBill.billNumber.split("/")[2]);
  return "Bill/2025/" + String(lastNum + 1).padStart(4, "0");
};

export const createVendorBill = async (req, res) => {
  const transaction = await sequelize.transaction();
  try {
    const { purchaseOrderId, billDate, dueDate, billReference, lines } =
      req.body;

    if (
      !purchaseOrderId ||
      !billDate ||
      !dueDate ||
      !lines ||
      lines.length === 0
    ) {
      return res
        .status(400)
        .json({ error: "Missing required fields for the bill." });
    }

    // Fetch the source Purchase Order to pre-fill data
    const sourcePO = await PurchaseOrder.findByPk(purchaseOrderId, {
      include: [{ model: PurchaseOrderLine, as: "lines" }],
    });

    if (!sourcePO) {
      return res
        .status(404)
        .json({ error: "Source Purchase Order not found." });
    }

    const billNumber = await getNextBillNumber();

    // Create Vendor Bill Header
    const newVendorBill = await VendorBill.create(
      {
        billNumber,
        billDate,
        dueDate,
        billReference: billReference || sourcePO.reference,
        contactId: sourcePO.contactId,
        purchaseOrderId: sourcePO.id,
        totalAmount: sourcePO.totalAmount, // Will be the same as the PO total
      },
      { transaction }
    );

    // Create Vendor Bill Lines from PO Lines
    for (const poLine of sourcePO.lines) {
      // Find the corresponding line from the request to get the accountId
      const reqLine = lines.find((l) => l.productId === poLine.productId);
      if (!reqLine || !reqLine.accountId) {
        throw new Error(
          `Account ID is missing for product ID ${poLine.productId}`
        );
      }

      await VendorBillLine.create(
        {
          vendorBillId: newVendorBill.id,
          productId: poLine.productId,
          quantity: poLine.quantity,
          unitPrice: poLine.unitPrice,
          untaxedAmount: poLine.untaxedAmount,
          taxId: poLine.taxId,
          taxAmount: poLine.taxAmount,
          total: poLine.total,
          accountId: reqLine.accountId,
        },
        { transaction }
      );
    }

    await transaction.commit();
    res
      .status(201)
      .json({
        message: "Vendor Bill created successfully!",
        data: newVendorBill,
      });
  } catch (error) {
    await transaction.rollback();
    console.error("Failed to create vendor bill:", error);
    res
      .status(500)
      .json({ error: "Failed to create vendor bill.", details: error.message });
  }
};
