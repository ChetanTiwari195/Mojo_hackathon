import { sequelize } from "../db/index.js";
import SalesPayment from "../models/salesPayment.model.js";
import SalesBill from "../models/salesBill.model.js";
import Account from "../models/account.model.js";

// Helper function to generate the next receipt number (e.g., Rec/25/0001)
const getNextPaymentNumber = async () => {
  const lastPayment = await SalesPayment.findOne({
    order: [["paymentNumber", "DESC"]],
  });
  if (!lastPayment) return "Rec/25/0001";
  const lastNum = parseInt(lastPayment.paymentNumber.split("/")[2]);
  return "Rec/25/" + String(lastNum + 1).padStart(4, "0");
};

/**
 * Creates a new Sales Payment and marks the corresponding bill as 'paid'.
 * @param {object} req - The request object.
 * @param {object} res - The response object.
 */
export const createSalesPayment = async (req, res) => {
  const transaction = await sequelize.transaction();
  try {
    const { salesBillId, paymentDate, journalId, note } = req.body;

    if (!salesBillId || !paymentDate || !journalId) {
      return res.status(400).json({
        error:
          "Sales Bill ID, Payment Date, and Payment Via (journalId) are required.",
      });
    }

    const billToPay = await SalesBill.findByPk(salesBillId);
    if (!billToPay) {
      return res.status(404).json({ error: "Sales Bill not found." });
    }
    if (billToPay.status === "paid") {
      return res
        .status(400)
        .json({ error: "This bill has already been paid." });
    }

    const journalAccount = await Account.findByPk(journalId);
    if (!journalAccount || journalAccount.accountType !== "Assets") {
      return res.status(400).json({
        error: "Invalid Journal account. It must be an Asset (Cash or Bank).",
      });
    }

    const paymentNumber = await getNextPaymentNumber();

    const newPayment = await SalesPayment.create(
      {
        paymentNumber,
        paymentType: "receive", // Changed to "receive" for sales
        amount: billToPay.totalAmount,
        paymentDate,
        note,
        contactId: billToPay.contactId,
        salesBillId: billToPay.id,
        journalId,
      },
      { transaction }
    );

    billToPay.status = "paid";
    await billToPay.save({ transaction });

    await transaction.commit();
    res.status(201).json({
      message: "Sales Payment recorded successfully!",
      data: newPayment,
    });
  } catch (error) {
    await transaction.rollback();
    console.error("Failed to create sales payment:", error);
    res.status(500).json({
      error: "Failed to create sales payment.",
      details: error.message,
    });
  }
};
