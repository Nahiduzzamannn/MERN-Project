const mongoose = require("mongoose");

const PostSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, index: true },
    authorName: { type: String, required: true, trim: true },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      index: true,
      required: false,
    },
    coverImage: { type: String, default: "" },
    tags: { type: [String], default: [], index: true },
    excerpt: { type: String, default: "" },
    content: { type: String, required: true },
    published: { type: Boolean, default: true },
    publishedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

PostSchema.index({ title: "text", excerpt: "text", content: "text" });

function toSlug(str) {
  return String(str)
    .toLowerCase()
    .trim()
    .replace(/['"]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}


async function generateUniqueSlug(title, excludeId = null) {
  let baseSlug = toSlug(title);
  let slug = baseSlug;
  let counter = 1;

  while (true) {
    const query = { slug };
    if (excludeId) query._id = { $ne: excludeId };

    const existing = await mongoose.model("Post").findOne(query);
    if (!existing) return slug;

    slug = `${baseSlug}-${counter}`;
    counter++;
  }
}


PostSchema.pre("validate", async function (next) {
  if (!this.slug && this.title) {
    this.slug = await generateUniqueSlug(this.title, this._id);
  }
  if (!this.excerpt && this.content) {
    const text = String(this.content)
      .replace(/<[^>]*>/g, "")
      .trim();
    this.excerpt = text.slice(0, 160);
  }
  next();
});

module.exports = mongoose.model("Post", PostSchema);
