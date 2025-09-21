import { sequelize } from "../db/index.js";
import SalesBill from "../models/salesBill.model.js";
import SalesBillLine from "../models/salesBillLine.model.js";
import ContactMaster from "../models/contactMaster.model.js";
import Product from "../models/product.model.js";
import Account from "../models/account.model.js";
import User from "../models/User.js";

/**
 * Retrieves a single Sales Bill (Invoice) by its ID for the currently logged-in customer.
 * It also includes all associated line items and product/account details.
 * @param {object} req - The request object, with `req.user` from auth middleware.
 * @param {object} res - The response object.
 */
export const getCustomerInvoiceById = async (req, res) => {
  try {
    const { id } = req.params; // The invoice ID from the URL

    // The authentication middleware should attach the user ID to the request object.
    const loggedInUserId = req.user.id;

    // Find the contact (customer) associated with the logged-in user.
    // This assumes a 1-to-1 relationship between a User and a ContactMaster record.
    const customer = await ContactMaster.findOne({ where: { userId: loggedInUserId } });

    if (!customer) {
      return res.status(403).json({ error: "Access denied. Not a valid customer account." });
    }

    // Now, fetch the sales bill using the ID from params, but
    // also ensure it belongs to the logged-in customer.
    const customerInvoice = await SalesBill.findOne({
      where: {
        id: id,
        contactId: customer.id, // CRITICAL: This is the security check
      },
      include: [
        {
          model: ContactMaster,
          as: "customer",
          attributes: ["contactName", "email", "phone", "street", "city", "state", "postalCode", "country", "taxId"], // Specify fields to include
        },
        {
          model: SalesBillLine,
          as: "lineItems",
          include: [
            {
              model: Product,
              as: "product",
              attributes: ["productName", "sku", "hsnCode"],
            },
            {
              model: Account,
              as: "account",
              attributes: ["accountName"],
            },
          ],
        },
      ],
    });

    if (!customerInvoice) {
      // Return 404 if the invoice doesn't exist or doesn't belong to the customer
      return res.status(404).json({ error: "Invoice not found or access denied." });
    }

    res.status(200).json({ data: customerInvoice });
  } catch (error) {
    console.error("Error fetching customer invoice:", error);
    res.status(500).json({
      error: "Failed to fetch customer invoice.",
      details: error.message,
    });
  }
};