const express = require("express");
const router = express.Router();
const {
  getPosts,
  getPostBySlug,
  getTags,
  createPost,
  updatePost,
  deletePost,
  validateCreatePost,
  validateUpdatePost,
  getMyPosts,
  getPostByIdForEdit,
} = require("../Controllers/postController");
const { requireAuth } = require("../Middleware/auth");

router.get("/", getPosts);

router.get("/tags", getTags);

router.get("/mine", requireAuth, getMyPosts);

router.get("/:id/edit", requireAuth, getPostByIdForEdit);

router.post("/", requireAuth, validateCreatePost, createPost);

router.patch("/:id", requireAuth, validateUpdatePost, updatePost);

router.delete("/:id", requireAuth, deletePost);

router.get("/:slug", getPostBySlug);

module.exports = router;
