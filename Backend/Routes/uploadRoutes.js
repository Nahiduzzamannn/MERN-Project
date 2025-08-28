// filepath: Backend/Routes/uploadRoutes.js
const express = require("express");
const router = express.Router();
const { requireAuth } = require("../Middleware/auth");
const {
  uploadMiddleware,
  handleUpload,
} = require("../Controllers/uploadController");

// POST /api/upload/image
router.post("/image", requireAuth, uploadMiddleware, handleUpload);

module.exports = router;
