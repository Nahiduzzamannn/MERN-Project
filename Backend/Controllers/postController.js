
const Post = require('../Models/Post');

const toInt = (v, d) => {
  const n = parseInt(v, 10);
  return Number.isFinite(n) && n > 0 ? n : d;
};

// GET /api/posts?search=&tag=&page=1&limit=10
exports.getPosts = async (req, res, next) => {
  try {
    const page = toInt(req.query.page, 1);
    const limit = toInt(req.query.limit, 10);
    const search = (req.query.search || '').trim();
    const tag = (req.query.tag || '').trim();
    const filter = { published: true };

    if (tag) filter.tags = { $in: [new RegExp(`^${tag}$`, 'i')] };
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { tags: { $in: [new RegExp(search, 'i')] } },
      ];
    }

    const skip = (page - 1) * limit;

    const [items, total] = await Promise.all([
      Post.find(filter)
        .select('title slug authorName coverImage tags excerpt publishedAt')
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

// GET /api/posts/:slug
exports.getPostBySlug = async (req, res, next) => {
  try {
    const post = await Post.findOne({ slug: req.params.slug, published: true }).lean();
    if (!post) return res.status(404).json({ message: 'Post not found' });
    res.json(post);
  } catch (e) {
    next(e);
  }
};

// GET /api/posts/tags
exports.getTags = async (req, res, next) => {
  try {
    const tags = await Post.distinct('tags', { published: true });
    tags.sort((a, b) => a.localeCompare(b, undefined, { sensitivity: 'base' }));
    res.json(tags);
  } catch (e) {
    next(e);
  }
};
