// syncUser.js
import { sequelize } from "../src/db/index.js";
import User from "../src/models/User.js";

const syncUser = async () => {
  try {
    await sequelize.sync({ alter: true }); // creates/updates table
    console.log("✅ User table synced successfully!");
    process.exit();
  } catch (err) {
    console.error("❌ Error syncing User table:", err);
    process.exit(1);
  }
};

syncUser();
