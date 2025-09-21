// src/controllers/profitLoss.controller.js
import SalesPayment from "../models/salesPayment.model.js";
import VendorPayment from "../models/vendorPayment.model.js";

export const getProfitLoss = async (req, res) => {
  try {
    // Sales side (customer money received)
    const totalSalesReceived = await SalesPayment.sum("amount", {
      where: { paymentType: "receive" },
    });

    console.log(totalSalesReceived)

    // Purchases side (money paid to vendors)
    const totalVendorPaid = await VendorPayment.sum("amount", {
      where: { paymentType: "send" },
    });

    console.log(totalVendorPaid)

    const profitLoss = (totalSalesReceived || 0) - (totalVendorPaid || 0);

    res.json({
      sales: totalSalesReceived || 0,
      purchase: totalVendorPaid || 0,
      profitLoss,
    });
  } catch (err) {
    console.error("Error generating P&L:", err);
    res.status(500).json({ error: "Failed to generate P&L" });
  }
};
