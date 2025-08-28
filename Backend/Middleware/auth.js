const jwt = require("jsonwebtoken");
const User = require("../Models/User");

const JWT_SECRET = process.env.JWT_SECRET || "dev_jwt_secret_change_me";

function getTokenFromReq(req) {
  const auth = req.headers.authorization || "";
  if (auth.toLowerCase().startsWith("bearer ")) {
    return auth.slice(7);
  }
  if (req.cookies && req.cookies.token) return req.cookies.token;
  return null;
}

async function verifyAndLoadUser(token) {
  try {
    const payload = jwt.verify(token, JWT_SECRET);
    const user = await User.findById(payload.id);
    return user || null;
  } catch (e) {
    return null;
  }
}

exports.optionalAuth = async (req, _res, next) => {
  const token = getTokenFromReq(req);
  if (!token) return next();
  const user = await verifyAndLoadUser(token);
  if (user) req.user = user;
  return next();
};

exports.requireAuth = async (req, res, next) => {
  const token = getTokenFromReq(req);
  if (!token) return res.status(401).json({ message: "Unauthorized" });
  const user = await verifyAndLoadUser(token);
  if (!user) return res.status(401).json({ message: "Unauthorized" });
  req.user = user;
  return next();
};
