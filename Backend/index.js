const express = require("express");
const app = express();
const cors = require("cors");
const cookieParser = require("cookie-parser");
const rateLimit = require("express-rate-limit");
require("dotenv").config();
const { DbConnection } = require("./DB/connection");
const { notFound, errorHandler } = require("./Middleware/errorHandler");
const postRoutes = require("./Routes/postRouters");
const authRoutes = require("./Routes/authRoutes");
const path = require("path");
const uploadRoutes = require("./Routes/uploadRoutes");

DbConnection();

const corsOptions = {
  origin: process.env.FRONTEND_ORIGIN || "http://localhost:5173",
  credentials: true,
};

// Rate limiters
// const authLimiter = rateLimit({
//   windowMs: 15 * 60 * 1000,
//   max: 10,
//   standardHeaders: true,
//   legacyHeaders: false,
// });

const searchLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 60,
  standardHeaders: true,
  legacyHeaders: false,
});

app.use(express.json());
app.use(cookieParser());
app.use(cors(corsOptions));


app.use("/uploads", express.static(path.join(__dirname, "uploads")));


app.get("/home", (req, res) => {
  res.send("Server is running...");
});


app.use("/api/auth", authRoutes);


app.use(
  "/api/posts",
  (req, res, next) => {
    if (req.method === "GET") return searchLimiter(req, res, next);
    next();
  },
  postRoutes
);


app.use("/api/upload", uploadRoutes);


app.use(notFound);
app.use(errorHandler);

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server is running on ${port}`);
});
