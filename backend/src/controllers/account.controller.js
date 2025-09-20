import Account from "../models/account.model.js";

// Create a new account
export const createAccount = async (req, res) => {
  try {
    const { accountName, accountType } = req.body;

    if (!accountName || !accountType) {
      return res
        .status(400)
        .json({ error: "Account Name and Type are required." });
    }

    // Optional: Validate accountType against the allowed ENUM values
    const allowedTypes = ["Assets", "Liabilities", "Income", "Expense"];
    if (!allowedTypes.includes(accountType)) {
      return res.status(400).json({ error: "Invalid account type." });
    }

    const newAccount = await Account.create({ accountName, accountType });
    res
      .status(201)
      .json({ message: "Account created successfully!", data: newAccount });
  } catch (error) {
    res
      .status(500)
      .json({ error: "Failed to create account.", details: error.message });
  }
};

// Get all accounts (for dropdowns)
export const getAllAccounts = async (req, res) => {
  try {
    const accounts = await Account.findAll({
      order: [["accountName", "ASC"]], // Order them alphabetically
    });
    res.status(200).json({ data: accounts });
  } catch (error) {
    res
      .status(500)
      .json({ error: "Failed to fetch accounts.", details: error.message });
  }
};
