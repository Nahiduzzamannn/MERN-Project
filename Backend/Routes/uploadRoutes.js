
const express = require("express");
const router = express.Router();
const { requireAuth } = require("../Middleware/auth");
const {
  uploadMiddleware,
  handleUpload,
} = require("../Controllers/uploadController");


router.post("/image", requireAuth, uploadMiddleware, handleUpload);

module.exports = router;
