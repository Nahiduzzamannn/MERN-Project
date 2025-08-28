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

// Public posts feed with search + pagination
router.get("/", getPosts);

// Distinct tags
router.get("/tags", getTags);

// Authenticated: list my posts
router.get("/mine", requireAuth, getMyPosts);

// Authenticated: fetch post by id for editing
router.get("/:id/edit", requireAuth, getPostByIdForEdit);

// Create a post (auth required)
router.post("/", requireAuth, validateCreatePost, createPost);

// Update a post by id (auth + ownership)
router.patch("/:id", requireAuth, validateUpdatePost, updatePost);

// Delete a post by id (auth + ownership)
router.delete("/:id", requireAuth, deletePost);

// Post detail by slug (keep last to avoid route conflicts)
router.get("/:slug", getPostBySlug);

module.exports = router;
