import { sequelize } from "../db/index.js";
import SalesBill from "../models/salesBill.model.js";
import VendorBill from "../models/vendorBill.model.js";
import Account from "../models/account.model.js";
import VendorPayment from "../models/vendorPayment.model.js";
import SalesPayment from "../models/salesPayment.model.js";

/**
 * Generates a balance sheet.
 * @param {object} req - The request object.
 * @param {object} res - The response object.
 */
export const getBalanceSheet = async (req, res) => {
  try {
    const assets = await calculateAssets();
    const liabilities = await calculateLiabilities();
    const equity = await calculateEquity();

    const balanceSheet = {
      assets: {
        total: assets.total,
        details: assets.details,
      },
      liabilities: {
        total: liabilities.total,
        details: liabilities.details,
      },
      equity: {
        total: equity.total,
        details: equity.details,
      },
      balance: assets.total - (liabilities.total + equity.total),
    };

    res.status(200).json(balanceSheet);
  } catch (error) {
    console.error("Failed to generate balance sheet:", error);
    res.status(500).json({
      error: "Failed to generate balance sheet.",
      details: error.message,
    });
  }
};

const calculateAssets = async () => {
  // Cash and Bank Balances
  const cashAndBankAccounts = await Account.findAll({
    where: { accountType: "Assets" },
  });
  const cashAndBank = cashAndBankAccounts.reduce(
    (acc, account) => acc + account.currentBalance,
    0
  );

  // Accounts Receivable (unpaid sales bills)
  const accountsReceivable = await SalesBill.sum("totalAmount", {
    where: { status: "unpaid" },
  });

  const totalAssets = cashAndBank + accountsReceivable;

  return {
    total: totalAssets,
    details: {
      cashAndBank,
      accountsReceivable,
    },
  };
};

const calculateLiabilities = async () => {
  // Accounts Payable (unpaid vendor bills)
  const accountsPayable = await VendorBill.sum("totalAmount", {
    where: { status: "unpaid" },
  });

  const totalLiabilities = accountsPayable;

  return {
    total: totalLiabilities,
    details: {
      accountsPayable,
    },
  };
};

const calculateEquity = async () => {
  // A simple representation of equity: revenue minus expenses.
  // This can be expanded with more complex logic.
  const totalRevenue = await SalesBill.sum("totalAmount");
  const totalExpenses = await VendorBill.sum("totalAmount");

  const retainedEarnings = totalRevenue - totalExpenses;

  const totalEquity = retainedEarnings; // For this simple model

  return {
    total: totalEquity,
    details: {
      retainedEarnings,
    },
  };
};