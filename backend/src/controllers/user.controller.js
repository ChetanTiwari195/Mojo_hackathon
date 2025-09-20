import bcrypt from "bcrypt";
import { sequelize } from "../db/index.js";
import jwt from "jsonwebtoken";
import User from "../models/User.js";

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

// Login Controller
export const userLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    // 1️⃣ Check if user exists
    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // 2️⃣ Compare password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // 3️⃣ Generate JWT token
    const token = jwt.sign(
      { id: user.id, role: user.role, email: user.email },
      process.env.JWT_SECRET || "secretkey",
      { expiresIn: "1h" }
    );

    // 4️⃣ Send response
    res.status(200).json({
      message: "Login successful",
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });

  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Server error" });
  }
};
