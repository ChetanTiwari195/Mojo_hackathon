import bcrypt from "bcrypt";
import { sequelize } from "../db/index.js";

// Register User
export const userRegister = async (req, res) => {
  console.log(req.body);
  const { name, role, email, mobile = "", password, profile_image = "" } = req.body;

  if (!name || !role || !email || !password) {
    return res.status(400).json({ message: "Name, role, email, and password are required." });
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10);

    const query = `
      INSERT INTO users (name, role, email, mobile, password)
      VALUES (?, ?, ?, ?, ?)
    `;

    await sequelize.query(query, {
      replacements: [name, role, email, mobile, hashedPassword],
      type: sequelize.QueryTypes.INSERT
    });

    res.status(201).json({ message: "User registered successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error", error });
  }
};