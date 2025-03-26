require("dotenv").config();
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const crypto = require("crypto");
const validator = require("validator");
const nodemailer = require("nodemailer");
const pool = require("../config/db");

const generateToken = (user) => {
  return jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: "1h" }
  );
};

const signup = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const existingUser = await User.findByEmail(email);
    if (existingUser) {
      return res.status(400).json({ message: "Email already registered" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await User.createUser(name, email, hashedPassword);

    res
      .status(201)
      .json({ message: "User created successfully", user: newUser });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findByEmail(email);
    if (!user) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    const token = generateToken(user);

    res.status(200).json({ message: "Login successful", token, user });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

const forgotPassword = async (req, res) => {
  console.log("hello");
  const { email } = req.body;
  console.log("Request received with email:", email);
  try {
    if (!validator.isEmail(email)) {
      return res.status(400).json({ message: "Invalid email" });
    }
    const user = await User.findByEmail(email);
    if (!user) {
      return res.status(400).json({ message: "User not found" });
    }
    console.log(user);
    const resetToken = jwt.sign({ email }, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL,
        pass: process.env.PASSWORD,
      },
    });
    const resetUrl = `http://localhost:3000/reset-password/${resetToken}`;
    const mailOptions = {
      from: process.env.EMAIL,
      to: email,
      subject: "Password Reset Request",
      text: `To reset your password, please click on the link below:\n${resetUrl}`,
    };
    try {
      await transporter.sendMail(mailOptions);
      console.log(`Password reset email sent to ${email}`);
    } catch (emailError) {
      console.error("Email Sending Error:", emailError);
      return res
        .status(500)
        .json({ message: "Failed to send reset email. Try again later." });
    }
    res.status(200).json({ message: "Password reset email sent" });
  } catch (error) {
    console.log("Forgot password error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

const resetPassword = async (req, res) => {
  const { token, newPassword } = req.body;
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const email = decoded.email;

    const user = await User.findByEmail(email);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await pool.query("UPDATE users SET password = $1 WHERE email = $2", [
      hashedPassword,
      email,
    ]);

    res.status(200).json({ message: "Password reset successful" });
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      return res.status(400).json({ message: "Reset token has expired" });
    }
    console.error("Reset Password Error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const getUserDetails = async (req, res) => {
  try {
    console.log("Decoded user from token:", req.user);
    const userId = req.user.id;
    console.log(userId);
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    console.log(user);
    res.status(200).json({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      phone: user.phone || "",
      address: user.address || "",
      weight: user.weight || "",
      height: user.height || "",
      bloodGroup: user.blood_group || ""
    });
  } catch (error) {
    console.error("Error fetching user details:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const updateUserDetails = async (req, res) => {
  try {
    const userId = req.user.id;
    const updateData = {
      phone: req.body.phone,
      address: req.body.address,
      weight: req.body.weight,
      height: req.body.height,
      bloodGroup: req.body.bloodGroup,
    };
    console.log(updateData);
    const updatedUser = await User.updateUser(userId, updateData);
    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json(updatedUser);
  } catch (error) {
    console.error("Error updating user details:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const deleteUser = async (req, res) => {
  try {
      const userId = req.user.id;
      const deletedUser = await User.deleteUser(userId);

      if (!deletedUser) {
          return res.status(404).json({ message: "User not found" });
      }

      res.status(200).json({ message: "User deleted successfully" });
  } catch (error) {
      console.error("Error deleting user:", error);
      res.status(500).json({ message: "Internal server error" });
  }
};

module.exports = {
  signup,
  login,
  forgotPassword,
  resetPassword,
  getUserDetails,
  updateUserDetails,
  deleteUser
};
