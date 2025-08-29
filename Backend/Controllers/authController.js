const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const { body, validationResult } = require("express-validator");
const User = require("../Models/User");

const JWT_SECRET = process.env.JWT_SECRET || "dev_jwt_secret_change_me";
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "7d";

const buildTokenPayload = (user) => ({
  id: user._id,
  email: user.email,
  name: user.name,
  role: user.role,
});
const signToken = (user) =>
  jwt.sign(buildTokenPayload(user), JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });

const cookieOpts = {
  httpOnly: true,
  sameSite: "lax",
  secure: process.env.NODE_ENV === "production",
};

exports.validateSignup = [
  body("name")
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage("Name 2-100 chars"),
  body("email").isEmail().withMessage("Valid email required").normalizeEmail(),
  body("password").isLength({ min: 6 }).withMessage("Password min 6 chars"),
];

exports.validateLogin = [
  body("email").isEmail().withMessage("Valid email required").normalizeEmail(),
  body("password").isLength({ min: 1 }).withMessage("Password required"),
];

exports.signup = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty())
      return res.status(400).json({ errors: errors.array() });

    const { name, email, password } = req.body;

    const existing = await User.findOne({ email });
    if (existing)
      return res.status(409).json({ message: "Email already in use" });

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const user = await User.create({ name, email, passwordHash });

    const token = signToken(user);
    res.cookie("token", token, {
      ...cookieOpts,
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });
    return res.status(201).json({ user: user.toSafeJSON(), token });
  } catch (e) {
    next(e);
  }
};

exports.login = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty())
      return res.status(400).json({ errors: errors.array() });

    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(401).json({ message: "Invalid credentials" });

    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) return res.status(401).json({ message: "Invalid credentials" });

    const token = signToken(user);
    res.cookie("token", token, {
      ...cookieOpts,
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });
    return res.json({ user: user.toSafeJSON(), token });
  } catch (e) {
    next(e);
  }
};

exports.logout = async (req, res) => {
  res.clearCookie("token", { ...cookieOpts });
  res.status(204).end();
};

exports.me = async (req, res) => {
  if (!req.user) return res.json({ user: null });
  res.json({ user: req.user.toSafeJSON ? req.user.toSafeJSON() : req.user });
};
