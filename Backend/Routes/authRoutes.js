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


router.post("/signup", validateSignup, signup);


router.post("/login", validateLogin, login);


router.post("/logout", logout);


router.get("/me", optionalAuth, me);

module.exports = router;
