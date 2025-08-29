const Post = require("../Models/Post");
const { body, validationResult, param } = require("express-validator");
const sanitizeHtml = require("sanitize-html");

const toInt = (v, d) => {
  const n = parseInt(v, 10);
  return Number.isFinite(n) && n > 0 ? n : d;
};

const sanitizeOptions = {
  allowedTags: [
    "p",
    "br",
    "hr",
    "span",
    "strong",
    "b",
    "em",
    "i",
    "u",
    "s",
    "blockquote",
    "code",
    "pre",
    "ul",
    "ol",
    "li",
    "a",
    "img",
    "h1",
    "h2",
    "h3",
    "h4",
    "h5",
    "h6",
  ],
  allowedAttributes: {
    a: ["href", "title", "target", "rel"],
    img: ["src", "alt", "title", "width", "height"],
    "*": ["class"],
  },
  allowedSchemes: ["http", "https", "mailto"],
  allowProtocolRelative: false,
};


exports.getPosts = async (req, res, next) => {
  try {
    const page = toInt(req.query.page, 1);
    const limit = toInt(req.query.limit, 10);
    const search = (req.query.search || "").trim();
    const tag = (req.query.tag || "").trim();
    const filter = { published: true };

    if (tag) filter.tags = { $in: [new RegExp(`^${tag}$`, "i")] };
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: "i" } },
        { tags: { $in: [new RegExp(search, "i")] } },
      ];
    }

    const skip = (page - 1) * limit;

    const [items, total] = await Promise.all([
      Post.find(filter)
        .select("title slug authorName coverImage tags excerpt publishedAt")
        .sort({ publishedAt: -1, _id: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Post.countDocuments(filter),
    ]);

    res.json({
      data: items,
      page,
      limit,
      total,
      hasMore: skip + items.length < total,
    });
  } catch (e) {
    next(e);
  }
};


exports.getPostBySlug = async (req, res, next) => {
  try {
    const post = await Post.findOne({
      slug: req.params.slug,
      published: true,
    }).lean();
    if (!post) return res.status(404).json({ message: "Post not found" });
    res.json(post);
  } catch (e) {
    next(e);
  }
};


exports.getTags = async (req, res, next) => {
  try {
    const tags = await Post.distinct("tags", { published: true });
    tags.sort((a, b) => a.localeCompare(b, undefined, { sensitivity: "base" }));
    res.json(tags);
  } catch (e) {
    next(e);
  }
};


exports.getMyPosts = async (req, res, next) => {
  try {
    const items = await Post.find({ userId: req.user._id })
      .select(
        "title slug authorName coverImage tags excerpt published publishedAt createdAt updatedAt"
      )
      .sort({ updatedAt: -1 })
      .lean();
    res.json({ data: items });
  } catch (e) {
    next(e);
  }
};


exports.getPostByIdForEdit = [
  param("id").isMongoId(),
  async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty())
        return res.status(400).json({ errors: errors.array() });
      const post = await Post.findById(req.params.id);
      if (!post) return res.status(404).json({ message: "Post not found" });
      if (!post.userId || String(post.userId) !== String(req.user._id)) {
        return res.status(403).json({ message: "Forbidden" });
      }
      res.json({
        id: post._id,
        title: post.title,
        slug: post.slug,
        authorName: post.authorName,
        coverImage: post.coverImage,
        tags: post.tags,
        excerpt: post.excerpt,
        content: post.content,
        published: post.published,
        publishedAt: post.publishedAt,
      });
    } catch (e) {
      next(e);
    }
  },
];


exports.validateCreatePost = [
  body("title").trim().isLength({ min: 3 }).withMessage("Title is required"),
  body("authorName")
    .trim()
    .isLength({ min: 2 })
    .withMessage("Author name required"),
  body("content")
    .isString()
    .isLength({ min: 10 })
    .withMessage("Content too short"),
  body("coverImage")
    .optional({ nullable: true, checkFalsy: true })
    .isURL({ require_tld: false })
    .withMessage("coverImage must be a URL"),
  body("tags")
    .optional()
    .isArray()
    .withMessage("tags must be an array of strings"),
  body("tags.*").optional().isString(),
  body("published").optional().isBoolean(),
];

exports.validateUpdatePost = [
  param("id").isMongoId(),
  body("title").optional().trim().isLength({ min: 3 }),
  body("authorName").optional().trim().isLength({ min: 2 }),
  body("content").optional().isString().isLength({ min: 10 }),
  body("coverImage")
    .optional({ nullable: true, checkFalsy: true })
    .isURL({ require_tld: false }),
  body("tags").optional().isArray(),
  body("tags.*").optional().isString(),
  body("published").optional().isBoolean(),
];

exports.createPost = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty())
      return res.status(400).json({ errors: errors.array() });

    const {
      title,
      authorName,
      coverImage = "",
      tags = [],
      content,
      published = false,
    } = req.body;
    const sanitized = sanitizeHtml(content, sanitizeOptions);

    const now = new Date();
    const post = await Post.create({
      title,
      authorName,
      coverImage,
      tags: Array.isArray(tags) ? tags : [],
      content: sanitized,
      published,
      publishedAt: published ? now : null,
      userId: req.user?._id || null,
    });

    res.status(201).json({ id: post._id, slug: post.slug });
  } catch (e) {
    next(e);
  }
};

exports.updatePost = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty())
      return res.status(400).json({ errors: errors.array() });

    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: "Post not found" });
    if (!post.userId || String(post.userId) !== String(req.user._id)) {
      return res.status(403).json({ message: "Forbidden" });
    }

    const fields = [
      "title",
      "authorName",
      "coverImage",
      "tags",
      "content",
      "published",
    ];
    for (const k of fields) {
      if (typeof req.body[k] !== "undefined") {
        if (k === "content") {
          post.content = sanitizeHtml(String(req.body[k]), sanitizeOptions);
        } else {
          post[k] = req.body[k];
        }
      }
    }

    // manage published/publishedAt toggle
    if (typeof req.body.published !== "undefined") {
      if (req.body.published && !post.publishedAt)
        post.publishedAt = new Date();
      if (!req.body.published) post.publishedAt = null;
    }

    await post.save();
    res.json({ id: post._id, slug: post.slug });
  } catch (e) {
    next(e);
  }
};

exports.deletePost = async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: "Post not found" });
    if (!post.userId || String(post.userId) !== String(req.user._id)) {
      return res.status(403).json({ message: "Forbidden" });
    }
    await post.deleteOne();
    res.status(204).end();
  } catch (e) {
    next(e);
  }
};
