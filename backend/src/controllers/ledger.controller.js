import { Op } from "sequelize";
import VendorBill from "../models/vendorBill.model.js";
import VendorPayment from "../models/vendorPayment.model.js";
import ContactMaster from "../models/contactMaster.model.js";

const getLedger = async (req, res) => {
  try {
    // Fetch all vendor bills
    const bills = await VendorBill.findAll({
      include: [
        {
          model: ContactMaster,
          attributes: ["contactName"],
        },
      ],
      order: [["billDate", "ASC"]],
    });

    // Fetch all vendor payments
    const payments = await VendorPayment.findAll({
      include: [
        {
          model: ContactMaster,
          attributes: ["contactName"],
        },
      ],
      order: [["paymentDate", "ASC"]],
    });

    // Combine and format the data
    const combinedLedger = [];

    // Process bills
    for (const bill of bills) {
      combinedLedger.push({
        partnerName: bill.ContactMaster.contactName,
        accountName: "Creditor A/c",
        invoiceRef: bill.billNumber,
        invoiceDate: bill.billDate,
        dueDate: bill.dueDate,
        amount: parseFloat(bill.totalAmount),
        // Balance calculation would be more complex in a real app,
        // but for this example, we'll set it to the bill amount
        balance: parseFloat(bill.totalAmount),
      });
    }

    // Process payments
    for (const payment of payments) {
      combinedLedger.push({
        partnerName: payment.ContactMaster.contactName,
        accountName: "Creditor A/c",
        invoiceRef: payment.paymentNumber,
        invoiceDate: payment.paymentDate,
        dueDate: null,
        amount: -1 * parseFloat(payment.amount), // Payments decrease the balance
        balance: null, // Balance is usually tracked per partner, not per payment line
      });
    }

    // A more robust system would calculate the running balance for each partner.
    // For this demonstration, we'll just return the combined, unsorted list.
    // Sorting by date is crucial for a real ledger.
    combinedLedger.sort(
      (a, b) => new Date(a.invoiceDate) - new Date(b.invoiceDate)
    );

    return res.status(200).json(combinedLedger);
  } catch (error) {
    console.error("Error fetching ledger data:", error);
    return res.status(500).json({ error: "Failed to fetch ledger data" });
  }
};

export { getLedger };
