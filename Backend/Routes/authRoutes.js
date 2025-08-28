const express = require("express");
const router = express.Router();
const {
  signup,
  login,
  logout,
  me,
  validateSignup,
  validateLogin,
} = require("../Controllers/authController");
const { requireAuth, optionalAuth } = require("../Middleware/auth");

// Sign up
router.post("/signup", validateSignup, signup);

// Login
router.post("/login", validateLogin, login);

// Logout (clears cookie)
router.post("/logout", logout);

// Current user (do not force auth; return { user: null } if not logged in)
router.get("/me", optionalAuth, me);

module.exports = router;
