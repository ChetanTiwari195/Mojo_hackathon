import { Op } from "sequelize";
import SalesBill from "../models/salesBill.model.js";
import VendorBill from "../models/vendorBill.model.js";
import SalesPayment from "../models/salesPayment.model.js";
import VendorPayment from "../models/vendorPayment.model.js";

/**
 * Helper function to calculate totals for a specific time period.
 * @param {object} model - The Sequelize model (e.g., SalesBill).
 * @param {string} column - The name of the column to sum.
 * @param {string} dateField - The name of the date field to filter by.
 * @param {number} days - The number of days to look back.
 * @returns {Promise<number>} The total amount.
 */
const calculateTotal = async (model, column, dateField, days) => {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  const total = await model.sum(column, {
    where: {
      [dateField]: {
        [Op.gte]: startDate,
      },
    },
  });

  return total || 0;
};

/**
 * Calculates and returns a summary of dashboard metrics.
 * @param {object} req - The request object.
 * @param {object} res - The response object.
 */
export const getDashboardSummary = async (req, res) => {
  try {
    const sales = {
      last24Hours: await calculateTotal(SalesBill, "totalAmount", "createdAt", 1),
      last7Days: await calculateTotal(SalesBill, "totalAmount", "createdAt", 7),
      last30Days: await calculateTotal(SalesBill, "totalAmount", "createdAt", 30),
    };

    const purchases = {
      last24Hours: await calculateTotal(VendorBill, "totalAmount", "createdAt", 1),
      last7Days: await calculateTotal(VendorBill, "totalAmount", "createdAt", 7),
      last30Days: await calculateTotal(VendorBill, "totalAmount", "createdAt", 30),
    };

    const paymentsReceived = {
      last24Hours: await calculateTotal(SalesPayment, "amount", "paymentDate", 1),
      last7Days: await calculateTotal(SalesPayment, "amount", "paymentDate", 7),
      last30Days: await calculateTotal(SalesPayment, "amount", "paymentDate", 30),
    };

    const paymentsMade = {
      last24Hours: await calculateTotal(VendorPayment, "amount", "paymentDate", 1),
      last7Days: await calculateTotal(VendorPayment, "amount", "paymentDate", 7),
      last30Days: await calculateTotal(VendorPayment, "amount", "paymentDate", 30),
    };

    const totalPayments = {
      last24Hours: paymentsReceived.last24Hours + paymentsMade.last24Hours,
      last7Days: paymentsReceived.last7Days + paymentsMade.last7Days,
      last30Days: paymentsReceived.last30Days + paymentsMade.last30Days,
    };

    res.status(200).json({
      sales,
      purchases,
      payments: totalPayments,
    });
  } catch (error) {
    console.error("Failed to get dashboard summary:", error);
    res.status(500).json({
      error: "Failed to get dashboard summary.",
      details: error.message,
    });
  }
};
