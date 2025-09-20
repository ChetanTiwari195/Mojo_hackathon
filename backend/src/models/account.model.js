import { DataTypes } from "sequelize";
import { sequelize } from "../db/index.js";

const Account = sequelize.define("Account", {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  accountName: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  accountType: {
    type: DataTypes.ENUM("Assets", "Liabilities", "Income", "Expense"),
    allowNull: false,
  },
});

export default Account;
