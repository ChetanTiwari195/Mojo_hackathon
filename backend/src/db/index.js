import { Sequelize } from "sequelize";
import { DB_PASSWORD } from "../../constants.js";

// Use environment variables for host, user, password, and database name
const sequelize = new Sequelize(
  "mojo-DB",    // database name
  "root",       // username
  DB_PASSWORD,       // password
  {
    host: process.env.DB_HOST || "localhost",
    dialect: "mysql",
    logging: false
  }
);

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