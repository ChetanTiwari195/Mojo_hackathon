import { sequelize } from "../db/index.js";
import VendorPayment from "../models/vendorPayment.model.js";
import VendorBill from "../models/vendorBill.model.js";
import Account from "../models/account.model.js";

const getNextPaymentNumber = async () => {
  const lastPayment = await VendorPayment.findOne({
    order: [["paymentNumber", "DESC"]],
  });
  if (!lastPayment) return "Pay/25/0001";
  const lastNum = parseInt(lastPayment.paymentNumber.split("/")[2]);
  return "Pay/25/" + String(lastNum + 1).padStart(4, "0");
};

export const createVendorPayment = async (req, res) => {
  const transaction = await sequelize.transaction();
  try {
    const { vendorBillId, paymentDate, journalId, note } = req.body;

    if (!vendorBillId || !paymentDate || !journalId) {
      return res.status(400).json({
        error:
          "Vendor Bill ID, Payment Date, and Payment Via (journalId) are required.",
      });
    }

    const billToPay = await VendorBill.findByPk(vendorBillId);
    if (!billToPay) {
      return res.status(404).json({ error: "Vendor Bill not found." });
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

    const newPayment = await VendorPayment.create(
      {
        paymentNumber,
        paymentType: "send",
        amount: billToPay.totalAmount,
        paymentDate,
        note,
        contactId: billToPay.contactId,
        vendorBillId: billToPay.id,
        journalId,
      },
      { transaction }
    );

    billToPay.status = "paid";
    await billToPay.save({ transaction });

    await transaction.commit();
    res.status(201).json({
      message: "Vendor Payment recorded successfully!",
      data: newPayment,
    });
  } catch (error) {
    await transaction.rollback();
    console.error("Failed to create vendor payment:", error);
    res.status(500).json({
      error: "Failed to create vendor payment.",
      details: error.message,
    });
  }
};
