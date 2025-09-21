import { Op } from "sequelize";
import VendorBill from "../models/vendorBill.model.js";
import VendorPayment from "../models/vendorPayment.model.js";
import ContactMaster from "../models/contactMaster.model.js";

/**
 * @description Enhanced debugging controller for Balance Sheet
 */
const getBalanceSheet = async (req, res) => {
  try {
    console.log("=== ENHANCED BALANCE SHEET DEBUGGING ===");

    // Step 1: Validate models
    if (!ContactMaster || !VendorBill || !VendorPayment) {
      throw new Error("One or more models are not properly initialized");
    }

    // Step 2: Check raw data exists
    console.log("\n--- CHECKING RAW DATA ---");

    // Count total records
    const totalBillRecords = await VendorBill.count();
    const totalPaymentRecords = await VendorPayment.count();
    const totalContactRecords = await ContactMaster.count();

    console.log(`Total VendorBill records: ${totalBillRecords}`);
    console.log(`Total VendorPayment records: ${totalPaymentRecords}`);
    console.log(`Total ContactMaster records: ${totalContactRecords}`);

    if (totalBillRecords === 0 && totalPaymentRecords === 0) {
      console.log("⚠️ No data found in bills or payments tables");
      return res.status(200).json({
        success: true,
        data: {
          netProfit: 0,
          liabilities: [{ account: "Creditors A/c", amount: 0 }],
          assets: [
            { account: "Bank A/c", amount: 0 },
            { account: "Cash A/c", amount: 0 },
            { account: "Debtors A/c", amount: 0 },
          ],
        },
        message: "No transaction data found in database",
      });
    }

    // Step 3: Examine actual data structure
    console.log("\n--- EXAMINING DATA STRUCTURE ---");

    if (totalBillRecords > 0) {
      const sampleBill = await VendorBill.findOne({
        raw: true,
        limit: 1,
      });
      console.log("Sample VendorBill record:", sampleBill);
      console.log("VendorBill columns:", Object.keys(sampleBill || {}));
    }

    if (totalPaymentRecords > 0) {
      const samplePayment = await VendorPayment.findOne({
        raw: true,
        limit: 1,
      });
      console.log("Sample VendorPayment record:", samplePayment);
      console.log("VendorPayment columns:", Object.keys(samplePayment || {}));
    }

    if (totalContactRecords > 0) {
      const sampleContact = await ContactMaster.findOne({
        raw: true,
        limit: 1,
      });
      console.log("Sample ContactMaster record:", sampleContact);
      console.log("ContactMaster columns:", Object.keys(sampleContact || {}));
    }

    // Step 4: Check for amount columns with different names
    console.log("\n--- CHECKING AMOUNT COLUMNS ---");

    let billAmountColumn = null;
    let paymentAmountColumn = null;

    // Try different possible column names for bills
    const possibleBillColumns = [
      "totalAmount",
      "total_amount",
      "amount",
      "bill_amount",
      "grandTotal",
      "grand_total",
    ];
    for (const col of possibleBillColumns) {
      try {
        const testSum = await VendorBill.sum(col, {
          where: { [col]: { [Op.ne]: null } },
        });
        if (testSum !== null && testSum > 0) {
          billAmountColumn = col;
          console.log(
            `✓ Found working bill amount column: ${col} with sum: ${testSum}`
          );
          break;
        }
      } catch (error) {
        // Column doesn't exist, continue
      }
    }

    // Try different possible column names for payments
    const possiblePaymentColumns = [
      "amount",
      "payment_amount",
      "paidAmount",
      "paid_amount",
      "totalAmount",
    ];
    for (const col of possiblePaymentColumns) {
      try {
        const testSum = await VendorPayment.sum(col, {
          where: { [col]: { [Op.ne]: null } },
        });
        if (testSum !== null && testSum > 0) {
          paymentAmountColumn = col;
          console.log(
            `✓ Found working payment amount column: ${col} with sum: ${testSum}`
          );
          break;
        }
      } catch (error) {
        // Column doesn't exist, continue
      }
    }

    if (!billAmountColumn) {
      console.log("❌ Could not find valid bill amount column");
    }
    if (!paymentAmountColumn) {
      console.log("❌ Could not find valid payment amount column");
    }

    // Step 5: Get totals using discovered columns
    console.log("\n--- CALCULATING TOTALS ---");

    let totalBills = 0;
    let totalPayments = 0;

    if (billAmountColumn) {
      // Try without status filter first
      const allBillsSum = await VendorBill.sum(billAmountColumn, {
        where: { [billAmountColumn]: { [Op.ne]: null } },
      });
      console.log(`All bills sum (${billAmountColumn}):`, allBillsSum);

      // Try with different status filters
      const possibleStatusFilters = [
        { status: { [Op.ne]: "draft" } },
        { status: { [Op.ne]: "Draft" } },
        { status: { [Op.in]: ["approved", "paid", "completed"] } },
        { status: { [Op.in]: ["Approved", "Paid", "Completed"] } },
        {}, // No status filter
      ];

      for (const statusFilter of possibleStatusFilters) {
        try {
          const filteredSum = await VendorBill.sum(billAmountColumn, {
            where: {
              [billAmountColumn]: { [Op.ne]: null },
              ...statusFilter,
            },
          });
          console.log(
            `Bills with filter ${JSON.stringify(statusFilter)}:`,
            filteredSum
          );
          if (filteredSum > totalBills) {
            totalBills = filteredSum;
          }
        } catch (error) {
          console.log(
            `Filter ${JSON.stringify(statusFilter)} failed:`,
            error.message
          );
        }
      }
    }

    if (paymentAmountColumn) {
      totalPayments = await VendorPayment.sum(paymentAmountColumn, {
        where: { [paymentAmountColumn]: { [Op.ne]: null } },
      });
      console.log(`Total payments (${paymentAmountColumn}):`, totalPayments);
    }

    console.log(
      `Final totals - Bills: ${totalBills}, Payments: ${totalPayments}`
    );

    // Step 6: Check associations and foreign keys
    console.log("\n--- CHECKING ASSOCIATIONS ---");

    // Look for foreign key columns
    let contactIdColumn = null;
    const possibleFKColumns = [
      "contactId",
      "contact_id",
      "vendorId",
      "vendor_id",
      "customerId",
      "customer_id",
    ];

    if (totalBillRecords > 0) {
      const sampleBill = await VendorBill.findOne({ raw: true });
      for (const col of possibleFKColumns) {
        if (sampleBill && sampleBill[col] !== undefined) {
          contactIdColumn = col;
          console.log(`✓ Found FK column in VendorBill: ${col}`);
          break;
        }
      }
    }

    // Check if associations work
    let associationWorks = false;
    if (contactIdColumn) {
      try {
        const testJoin = await VendorBill.findOne({
          include: [
            {
              model: ContactMaster,
              required: false,
              attributes: ["id"],
            },
          ],
          limit: 1,
        });

        if (testJoin && testJoin.ContactMaster) {
          associationWorks = true;
          console.log("✓ Association working");
        } else {
          console.log("⚠️ Association defined but no joined data");
        }
      } catch (error) {
        console.log("❌ Association not working:", error.message);
      }
    }

    // Step 7: Find contact type column
    console.log("\n--- FINDING CONTACT TYPE COLUMN ---");

    let typeColumn = null;
    if (totalContactRecords > 0) {
      const sampleContact = await ContactMaster.findOne({ raw: true });
      const possibleTypeColumns = [
        "contactType",
        "contact_type",
        "type",
        "customerType",
        "partnerType",
        "category",
        "role",
        "entity_type",
      ];

      for (const col of possibleTypeColumns) {
        if (sampleContact && sampleContact[col] !== undefined) {
          typeColumn = col;
          console.log(`✓ Found type column: ${col}`);

          // Check what values exist
          const distinctValues = await ContactMaster.findAll({
            attributes: [[col, "type_value"]],
            group: [col],
            raw: true,
          });
          console.log(
            `Distinct values in ${col}:`,
            distinctValues.map((v) => v.type_value)
          );
          break;
        }
      }
    }

    // Step 8: Build response
    const balanceSheet = {
      netProfit: parseFloat((totalBills - totalPayments).toFixed(2)),
      liabilities: [
        {
          account: "Creditors A/c",
          amount: parseFloat(
            Math.max(0, totalBills - totalPayments).toFixed(2)
          ),
        },
      ],
      assets: [
        {
          account: "Bank A/c",
          amount: parseFloat(Math.max(0, totalPayments).toFixed(2)),
        },
        {
          account: "Cash A/c",
          amount: 0.0,
        },
        {
          account: "Debtors A/c",
          amount: parseFloat(
            Math.max(0, totalBills - totalPayments).toFixed(2)
          ),
        },
      ],
    };

    const debugInfo = {
      recordCounts: {
        bills: totalBillRecords,
        payments: totalPaymentRecords,
        contacts: totalContactRecords,
      },
      columnsFound: {
        billAmount: billAmountColumn,
        paymentAmount: paymentAmountColumn,
        contactType: typeColumn,
        foreignKey: contactIdColumn,
      },
      calculatedTotals: {
        totalBills,
        totalPayments,
      },
      associationStatus: associationWorks,
    };

    console.log("\n--- FINAL DEBUG INFO ---");
    console.log(JSON.stringify(debugInfo, null, 2));

    return res.status(200).json({
      success: true,
      data: balanceSheet,
      debug: debugInfo,
      message:
        totalBills > 0 || totalPayments > 0
          ? "Balance sheet generated with data"
          : "Balance sheet generated but no transaction amounts found",
    });
  } catch (error) {
    console.error("❌ Critical error:", error);

    return res.status(500).json({
      success: false,
      error: "Failed to generate balance sheet",
      message: error.message,
      stack: process.env.NODE_ENV === "development" ? error.stack : undefined,
      fallback: {
        netProfit: 0,
        liabilities: [{ account: "Creditors A/c", amount: 0 }],
        assets: [
          { account: "Bank A/c", amount: 0 },
          { account: "Cash A/c", amount: 0 },
          { account: "Debtors A/c", amount: 0 },
        ],
      },
    });
  }
};

export { getBalanceSheet };
