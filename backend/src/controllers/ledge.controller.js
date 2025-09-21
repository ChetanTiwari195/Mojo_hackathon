import { VendorBill } from "../models/vendorBill.model.js";
import { VendorPayment } from "../models/vendorPayment.model.js";
import { ContactMaster } from "../models/contactMaster.model.js";
import { sequelize } from "../db/index.js";

/**
 * @description Controller to generate a partner ledger report.
 * It fetches all vendor bills and payments, combines them,
 * sorts them by partner and date, and calculates a running balance.
 * @param {object} req Express request object
 * @param {object} res Express response object
 */
export const getPartnerLedger = async (req, res) => {
  try {
    // Step 1: Fetch all vendor bills and include the partner details
    const bills = await VendorBill.findAll({
      include: {
        model: ContactMaster,
        attributes: ["partnerName", "contactType"], // We need contactType to determine Creditor/Debtor
        required: true,
      },
      attributes: [
        "contactId",
        ["billNumber", "referenceNo"],
        ["billDate", "date"],
        "dueDate",
        ["totalAmount", "amount"],
      ],
      // Filter out draft bills as they don't affect the ledger
      where: { status: { [sequelize.Op.ne]: "draft" } },
    });

    // Step 2: Fetch all vendor payments and include the partner details
    const payments = await VendorPayment.findAll({
      include: {
        model: ContactMaster,
        attributes: ["partnerName", "contactType"],
        required: true,
      },
      attributes: [
        "contactId",
        ["paymentNumber", "referenceNo"],
        ["paymentDate", "date"],
        // Payments don't have a due date
        [sequelize.literal("NULL"), "dueDate"],
        // IMPORTANT: Make the payment amount negative for ledger calculation
        [sequelize.literal("amount * -1"), "amount"],
      ],
    });

    // Step 3: Standardize and combine both datasets
    // .get({ plain: true }) converts Sequelize instances to plain objects
    const allTransactions = [
      ...bills.map((bill) => bill.get({ plain: true })),
      ...payments.map((payment) => payment.get({ plain: true })),
    ];

    // Step 4: Sort transactions by partner (contactId) and then by date
    allTransactions.sort((a, b) => {
      if (a.contactId < b.contactId) return -1;
      if (a.contactId > b.contactId) return 1;
      // If contactId is the same, sort by date
      return new Date(a.date) - new Date(b.date);
    });

    // Step 5: Calculate the running balance
    const ledgerEntries = [];
    let currentBalance = 0;
    let lastContactId = null;

    for (const tx of allTransactions) {
      // If we're starting a new partner's ledger, reset the balance
      if (tx.contactId !== lastContactId) {
        currentBalance = 0;
      }

      currentBalance += parseFloat(tx.amount);

      // Determine the account name based on the contact type
      const accountName =
        tx.ContactMaster.contactType === "vendor"
          ? "Creditor A/c"
          : "Debtor A/c";

      ledgerEntries.push({
        partnerName: tx.ContactMaster.partnerName,
        accountName: accountName,
        referenceNo: tx.referenceNo,
        date: tx.date,
        dueDate: tx.dueDate,
        amount: parseFloat(tx.amount),
        balance: currentBalance,
      });

      lastContactId = tx.contactId;
    }

    res.status(200).json({
      success: true,
      message: "Partner ledger fetched successfully.",
      data: ledgerEntries,
    });
  } catch (error) {
    console.error("Error fetching partner ledger:", error);
    res.status(500).json({
      success: false,
      message: "An error occurred while fetching the partner ledger.",
      error: error.message,
    });
  }
};
