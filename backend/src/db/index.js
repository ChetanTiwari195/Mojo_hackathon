import { Sequelize } from "sequelize";
import { DB_NAME, DB_USER, DB_PASSWORD, DB_HOST } from "./credential.js";

// Use environment variables for host, user, password, and database name
const sequelize = new Sequelize(DB_NAME, DB_USER, DB_PASSWORD, {
  host: DB_HOST,
  dialect: "mysql",
  logging: false,
});

const connectDB = async () => {
  try {
    await sequelize.authenticate();
    console.log("\n✅ MySQL connected successfully!");
  } catch (error) {
    console.error("❌ MySQL connection error:", error);
    process.exit(1);
  }
};

export { sequelize, connectDB };
