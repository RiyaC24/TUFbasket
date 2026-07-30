const express = require("express");
const {
  registerUser,
  loginUser,
  logout,
} = require("../../controllers/auth/auth.controller");
const authMiddleware = require("../../middleware/auth.middleware");

const router = express.Router();

// Test route
router.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Auth API is running successfully!",
  });
});

// Register User
router.post("/register", registerUser);

// Login User
router.post("/login", loginUser);

// Logout User
router.post("/logout", logout);

// Check Authentication
router.get("/check-auth", authMiddleware, (req, res) => {
  const user = req.user;

  res.status(200).json({
    success: true,
    message: "Authenticated user!",
    user,
  });
});

module.exports = router;