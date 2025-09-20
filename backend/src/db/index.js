import { Sequelize } from "sequelize";

const sequelize = new Sequelize(
  "mojo-DB",       // database name
  process.env.DB_USER,       // username
  process.env.DB_PASSWORD,   // password
  {
    host: process.env.DB_HOST || "localhost",
    dialect: "mysql",        // or 'postgres', 'sqlite', 'mssql'
    logging: false           // disable SQL query logging
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
