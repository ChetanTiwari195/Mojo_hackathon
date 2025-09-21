import { DataTypes } from "sequelize";
import { sequelize } from "../db/index.js";
import Category from "./category.model.js";

const Product = sequelize.define("Product", {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  productName: {
    type: DataTypes.STRING,
    // allowNull: false,
    // unique: true,
  },
  productType: {
    type: DataTypes.ENUM("goods", "service"),
    allowNull: false,
    defaultValue: "goods",
  },
  salesPrice: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    defaultValue: 0.0,
  },
  purchasePrice: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    defaultValue: 0.0,
  },
  hsnCode: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  // New fields to store tax percentages directly
  salesTax: {
    type: DataTypes.DECIMAL(5, 2),
    allowNull: true,
    defaultValue: 0.0,
  },
  purchaseTax: {
    type: DataTypes.DECIMAL(5, 2),
    allowNull: true,
    defaultValue: 0.0,
  },
  // Foreign Key for Category remains
  categoryId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: "Categories",
      key: "id",
    },
  },
});

// Define Relationship to Category
Category.hasMany(Product, { foreignKey: "categoryId" });
// ✅ ADD THE ALIAS HERE
Product.belongsTo(Category, { foreignKey: "categoryId", as: "category" });

export default Product;
