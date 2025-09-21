import bcrypt from "bcrypt";
import { sequelize } from "../db/index.js";
import jwt from "jsonwebtoken";
import User from "../models/User.js";

// Register User
export const userRegister = async (req, res) => {
  console.log(req.body);
  const { name, role, email, password,password2, profile_image = "" } = req.body;

  if (!name || !role || !email || !password) {
    return res.status(400).json({ message: "Name, role, email, and password are required." });
  }

  if (password !== password2) {
    return res.status(400).json({ message: "Passwords do not match." });
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10);

    const query = `
      INSERT INTO users (name, role, email, password)
      VALUES (?, ?, ?, ?)
    `;

    await sequelize.query(query, {
      replacements: [name, role, email, hashedPassword],
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

// Update User
export const updateUser = async (req, res) => {
  try {
    const { id } = req.params; // user ID from URL
    const { name, role, email, password, profile_image } = req.body;

    // 1️⃣ Find the user
    const user = await User.findByPk(id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // 2️⃣ Prepare update data
    const updateData = {};
    if (name) updateData.name = name;
    if (role) updateData.role = role;
    if (email) updateData.email = email;
    if (profile_image !== undefined) updateData.profile_image = profile_image;

    // 3️⃣ Hash password if provided
    if (password) {
      const hashedPassword = await bcrypt.hash(password, 10);
      updateData.password = hashedPassword;
    }

    // 4️⃣ Update user
    await user.update(updateData);

    res.status(200).json({
      message: "User updated successfully",
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        profile_image: user.profile_image,
      },
    });
  } catch (error) {
    console.error("Update user error:", error);
    res.status(500).json({ message: "Server error", error });
  }
};

export const getAllUsers = async (req, res) => {
  try {
    const users = await User.findAll({
      attributes: { exclude: ["password"] }, // Exclude password from response
    });

    res.status(200).json({
      success: true,
      data: users,
    });
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error,
    });
  }
};

// Get User by id
export const getUserById = async (req, res) => {
  const { id } = req.params;

  try {
    const user = await User.findByPk(id, {
      attributes: { exclude: ["password"] }, // Exclude password
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: `User with ID ${id} not found`,
      });
    }

    res.status(200).json({
      success: true,
      data: user,
    });
  } catch (error) {
    console.error("Error fetching user:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error,
    });
  }
};

export const getUserProfile = async (req, res) => {
  // The authMiddleware has already verified the token and attached the user
  // to the request object (req.user). We just need to send it back.

  if (req.user) {
    res.status(200).json({
      user: {
        id: req.user.id,
        name: req.user.name,
        email: req.user.email,
        role: req.user.role,
      },
    });
  } else {
    res.status(404).json({ message: "User not found" });
  }
};
