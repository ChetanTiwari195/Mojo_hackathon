import { sequelize } from "../db/index.js";
import VendorBill from "../models/vendorBill.model.js";
import VendorBillLine from "../models/vendorBillLine.model.js";
import ContactMaster from "../models/contactMaster.model.js";
import Product from "../models/product.model.js";
import Account from "../models/account.model.js";
import Tax from "../models/tax.model.js";
import PurchaseOrder from "../models/purchaseOrder.model.js";

const getNextBillNumber = async () => {
  const lastBill = await VendorBill.findOne({
    order: [["billNumber", "DESC"]],
  });
  if (!lastBill) return "Bill/2025/0001";

  const parts = lastBill.billNumber.split("/");
  const lastNum = parseInt(parts[2]);
  const nextNum = String(lastNum + 1).padStart(4, "0");
  return `Bill/2025/${nextNum}`;
};

export const createVendorBill = async (req, res) => {
  console.log("\n--- [START] Attempting to create a new vendor bill at", new Date().toISOString(), "---");
  const transaction = await sequelize.transaction();
  try {
    const { vendorName, billDate, dueDate, billReference, lineItems, purchaseOrderId } = req.body;

    console.log("STEP 1: Received Raw Data. Body:", JSON.stringify(req.body, null, 2));

    if (!vendorName || !billDate || !dueDate || !lineItems || !lineItems.length) {
      console.error("[FAIL] Validation Error: Missing required fields.");
      return res.status(400).json({ error: "Missing required fields for the bill." });
    }
    console.log("[PASS] Initial validation of required fields.");

    if (purchaseOrderId) {
      console.log(`STEP 2: Validating Purchase Order ID: ${purchaseOrderId}`);
      const sourcePO = await PurchaseOrder.findByPk(purchaseOrderId);
      if (!sourcePO) {
        console.error(`[FAIL] Validation Error: Source PO with ID ${purchaseOrderId} not found.`);
        return res.status(404).json({ error: `Source Purchase Order with ID ${purchaseOrderId} not found.` });
      }
      console.log("[PASS] Purchase Order validated successfully.");
    }

    console.log(`STEP 3: Finding Vendor by name: '${vendorName}'`);
    const vendor = await ContactMaster.findOne({ where: { contactName: vendorName } });
    if (!vendor) {
      console.error(`[FAIL] Lookup Error: Vendor '${vendorName}' not found.`);
      return res.status(404).json({ error: `Vendor '${vendorName}' not found.` });
    }
    console.log(`[PASS] Found vendor with ID: ${vendor.id}`);

    let grandTotalAmount = 0;
    const processedLines = [];

    console.log("STEP 4: Processing Line Items...");
    for (const [index, item] of lineItems.entries()) {
      const itemNum = index + 1;
      console.log(`  [INFO] Processing line item #${itemNum}`);

      const product = await Product.findOne({ where: { productName: item.productName } });
      if (!product) throw new Error(`Product '${item.productName}' not found in the database.`);
      console.log(`  [PASS] Found product for item #${itemNum} with ID: ${product.id}`);

      // FIX: The key in the 'where' clause should be the column name 'accountName'.
      const account = await Account.findOne({ where: { accountName: item.accountName } });
      if (!account) throw new Error(`Account '${item.accountName}' not found in the database.`);
      console.log(`  [PASS] Found account for item #${itemNum} with ID: ${account.id}`);

      const tax = await Tax.findOne({ where: { value: item.taxRate } });
      if (!tax) throw new Error(`A tax entry for rate '${item.taxRate}%' was not found.`);
      console.log(`  [PASS] Found tax for item #${itemNum} with ID: ${tax.id}`);

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
      contactId: vendor.id,
      totalAmount: grandTotalAmount,
      status: 'posted',
      purchaseOrderId: purchaseOrderId || null,
    };

    console.log("STEP 6: Creating VendorBill record with data:", JSON.stringify(newBillData, null, 2));
    const newVendorBill = await VendorBill.create(newBillData, { transaction });
    console.log("[PASS] VendorBill record created successfully.");

    console.log("STEP 7: Creating VendorBillLine records...");
    for (const line of processedLines) {
      await VendorBillLine.create(
        { vendorBillId: newVendorBill.id, ...line },
        { transaction }
      );
    }
    console.log("[PASS] VendorBillLine records created successfully.");

    await transaction.commit();
    console.log("--- [SUCCESS] Transaction committed. Sending success response. ---");
    res.status(201).json({
      message: "Vendor Bill created successfully!",
      data: newVendorBill,
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

    res.status(500).json({ error: "Failed to create vendor bill.", details: error.message });
  }
};


