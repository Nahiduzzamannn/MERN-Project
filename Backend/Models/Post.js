const mongoose = require('mongoose');

const PostSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, index: true },
    authorName: { type: String, required: true, trim: true },
    coverImage: { type: String, default: '' },
    tags: { type: [String], default: [], index: true },
    excerpt: { type: String, default: '' },
    content: { type: String, required: true },
    published: { type: Boolean, default: true },
    publishedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

// Text index to support simple search
PostSchema.index({ title: 'text', excerpt: 'text', content: 'text' });

function toSlug(str) {
  return String(str)
    .toLowerCase()
    .trim()
    .replace(/['"]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

// Auto-fill slug and excerpt
PostSchema.pre('validate', function (next) {
  if (!this.slug && this.title) this.slug = toSlug(this.title);
  if (!this.excerpt && this.content) {
    const text = String(this.content).replace(/<[^>]*>/g, '').trim();
    this.excerpt = text.slice(0, 160);
  }
  next();
});

module.exports = mongoose.model('Post', PostSchema);
