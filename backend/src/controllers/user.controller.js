// src/controllers/userController.js
import bcrypt from "bcrypt";
import {connectDB} from "../db/index.js";

// Register User
export const userRegister = async (req, res) => {
  const { name, role, email, mobile, password, profile_image } = req.body;

  if (!name || !role || !email || !password) {
    return res.status(400).json({ message: "Name, role, email, and password are required." });
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10);

    const query = `
      INSERT INTO users (name, role, email, mobile, password, profile_image)
      VALUES (?, ?, ?, ?, ?, ?)
    `;

    connectDB.query(query, [name, role, email, mobile, hashedPassword, profile_image], (err, result) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ message: "Database error", error: err });
      }
      res.status(201).json({ message: "User registered successfully", userId: result.insertId });
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error", error });
  }
};
