import { sequelize } from "../db/index.js";
import SalesBill from "../models/salesBill.model.js";
import SalesBillLine from "../models/salesBillLine.model.js";
import ContactMaster from "../models/contactMaster.model.js";
import Product from "../models/product.model.js";
import Account from "../models/account.model.js";
import Tax from "../models/tax.model.js";
import SalesOrder from "../models/salesOrder.model.js";

// Helper function to generate the next invoice number (e.g., Inv/2025/0001)
const getNextBillNumber = async () => {
  const lastBill = await SalesBill.findOne({
    order: [["billNumber", "DESC"]],
  });
  if (!lastBill) return "Inv/2025/0001";

  const parts = lastBill.billNumber.split("/");
  const lastNum = parseInt(parts[2]);
  const nextNum = String(lastNum + 1).padStart(4, "0");
  return `Inv/2025/${nextNum}`;
};

/**
 * Creates a new Sales Bill (Invoice) and its line items.
 * @param {object} req - The request object.
 * @param {object} res - The response object.
 */
export const createSalesBill = async (req, res) => {
  console.log("\n--- [START] Attempting to create a new sales bill at", new Date().toISOString(), "---");
  const transaction = await sequelize.transaction();
  try {
    const { customerName, billDate, dueDate, billReference, lineItems, salesOrderId } = req.body;

    console.log("STEP 1: Received Raw Data. Body:", JSON.stringify(req.body, null, 2));

    if (!customerName || !billDate || !dueDate || !lineItems || !lineItems.length) {
      console.error("[FAIL] Validation Error: Missing required fields.");
      return res.status(400).json({ error: "Missing required fields for the bill." });
    }
    console.log("[PASS] Initial validation of required fields.");

    if (salesOrderId) {
      console.log(`STEP 2: Validating Sales Order ID: ${salesOrderId}`);
      const sourceSO = await SalesOrder.findByPk(salesOrderId);
      if (!sourceSO) {
        console.error(`[FAIL] Validation Error: Source SO with ID ${salesOrderId} not found.`);
        return res.status(404).json({ error: `Source Sales Order with ID ${salesOrderId} not found.` });
      }
      console.log("[PASS] Sales Order validated successfully.");
    }

    console.log(`STEP 3: Finding Customer by name: '${customerName}'`);
    const customer = await ContactMaster.findOne({ where: { contactName: customerName } });
    if (!customer) {
      console.error(`[FAIL] Lookup Error: Customer '${customerName}' not found.`);
      return res.status(404).json({ error: `Customer '${customerName}' not found.` });
    }
    console.log(`[PASS] Found customer with ID: ${customer.id}`);

    let grandTotalAmount = 0;
    const processedLines = [];

    console.log("STEP 4: Processing Line Items...");
    for (const [index, item] of lineItems.entries()) {
      const itemNum = index + 1;
      console.log(`  [INFO] Processing line item #${itemNum}`);

      const product = await Product.findOne({ where: { productName: item.productName } });
      if (!product) throw new Error(`Product '${item.productName}' not found in the database.`);
      console.log(`  [PASS] Found product for item #${itemNum} with ID: ${product.id}`);

      const account = await Account.findOne({ where: { accountName: item.accountName } });
      if (!account) throw new Error(`Account '${item.accountName}' not found in the database.`);
      console.log(`  [PASS] Found account for item #${itemNum} with ID: ${account.id}`);

      const tax = await Tax.findOne({ where: { value: item.taxRate } });
      if (!tax) throw new Error(`A tax entry for rate '${item.taxRate}%' was not found.`);
      console.log(`  [PASS] Found tax for item #${itemNum} with ID: ${tax.id}`);

      const untaxedAmount = (item.quantity || 0) * (item.unitPrice || 0);
      const taxAmount = untaxedAmount * ((item.taxRate || 0) / 100);
      const lineTotal = untaxedAmount + taxAmount;
      grandTotalAmount += lineTotal;

      processedLines.push({
        productId: product.id,
        accountId: account.id,
        taxId: tax.id,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        untaxedAmount,
        taxAmount,
        total: lineTotal,
      });
    }
    console.log("[PASS] All line items processed successfully.");

    const billNumber = await getNextBillNumber();
    console.log(`STEP 5: Generated new bill number: ${billNumber}`);

    const newBillData = {
      billNumber,
      billDate,
      dueDate,
      billReference,
      contactId: customer.id,
      totalAmount: grandTotalAmount,
      status: 'posted',
      salesOrderId: salesOrderId || null,
    };

    console.log("STEP 6: Creating SalesBill record with data:", JSON.stringify(newBillData, null, 2));
    const newSalesBill = await SalesBill.create(newBillData, { transaction });
    console.log("[PASS] SalesBill record created successfully.");

    console.log("STEP 7: Creating SalesBillLine records...");
    for (const line of processedLines) {
      await SalesBillLine.create(
        { salesBillId: newSalesBill.id, ...line },
        { transaction }
      );
    }
    console.log("[PASS] SalesBillLine records created successfully.");

    await transaction.commit();
    console.log("--- [SUCCESS] Transaction committed. Sending success response. ---");
    res.status(201).json({
      message: "Sales Bill created successfully!",
      data: newSalesBill,
    });

  } catch (error) {
    await transaction.rollback();
    console.error("\n--- [FATAL ERROR] Transaction rolled back. ---");
    console.error("Timestamp:", new Date().toISOString());
    console.error("Error Message:", error.message);

    // Log Sequelize-specific details if available
    if (error.name && error.name.includes('Sequelize')) {
      console.error("Sequelize Error Type:", error.name);
      console.error("Original SQL Query:", error.original?.sql);
      console.error("SQL Parameters:", error.original?.parameters);
      console.error("Database Error Code:", error.original?.code);
    }

    console.error("Full Error Stack:", error.stack);
    console.error("--- END ERROR LOG ---\n");

    res.status(500).json({ error: "Failed to create sales bill.", details: error.message });
  }
};
