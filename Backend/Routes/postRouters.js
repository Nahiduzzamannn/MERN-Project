const express = require('express');
const router = express.Router();
const { getPosts, getPostBySlug, getTags } = require('../Controllers/postController');

// Public posts feed with search + pagination
router.get('/', getPosts);

// Distinct tags
router.get('/tags', getTags);

// Post detail by slug
router.get('/:slug', getPostBySlug);

module.exports = router;
