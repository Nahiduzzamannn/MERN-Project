#!/usr/bin/env node

const axios = require("axios");
const mongoose = require("mongoose");
require("dotenv").config();
const Post = require("../Models/Post");

const MONGO_URI =
  process.env.MONGODB_URL ||
  process.env.MONGODB_URI ||
  "mongodb://localhost:27017/medium_clone";

function toSlug(str) {
  return String(str)
    .toLowerCase()
    .trim()
    .replace(/["']/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function randInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

async function run() {
  await mongoose.connect(MONGO_URI);
  console.log("Connected to", MONGO_URI);

  const [postsRes, usersRes] = await Promise.all([
    axios.get("https://jsonplaceholder.typicode.com/posts?_limit=30"),
    axios.get("https://jsonplaceholder.typicode.com/users"),
  ]);
  const users = usersRes.data || [];
  const userMap = new Map(users.map((u) => [u.id, u.name]));

  const TAG_POOL = [
    "react",
    "javascript",
    "node",
    "mongodb",
    "web",
    "css",
    "html",
    "express",
    "api",
    "auth",
  ];

  const docs = (postsRes.data || []).map((p) => {
    const title = p.title.replace(/\.$/, "");
    const slug = toSlug(title);
    const authorName = userMap.get(p.userId) || "Anonymous";

    const paragraphs = p.body
      .split("\n")
      .map((t) => `<p>${t}</p>`)
      .join("");
    const content = `<h2>${title}</h2>${paragraphs}<p><strong>Lorem ipsum</strong> dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor.</p>`;


    const tagCount = randInt(1, 3);
    const tags = Array.from(
      { length: tagCount },
      () => TAG_POOL[randInt(0, TAG_POOL.length - 1)]
    );

    const published = Math.random() > 0.2; 
    const daysAgo = randInt(1, 60);
    const publishedAt = published
      ? new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000)
      : null;

    return {
      title,
      slug,
      authorName,
      coverImage: `https://picsum.photos/seed/${encodeURIComponent(
        slug
      )}/1200/630`,
      tags: Array.from(new Set(tags)),
      excerpt: "", 
      content,
      published,
      publishedAt,
    };
  });

 
  const existingSlugs = new Set(
    (
      await Post.find({ slug: { $in: docs.map((d) => d.slug) } }).select("slug")
    ).map((x) => x.slug)
  );
  const toInsert = docs.filter((d) => !existingSlugs.has(d.slug));

  if (toInsert.length === 0) {
    console.log("Nothing to insert; all slugs already exist.");
  } else {
    const res = await Post.insertMany(toInsert, { ordered: false });
    console.log(`Inserted ${res.length} posts.`);
  }

  await mongoose.disconnect();
  console.log("Done.");
}

run().catch(async (err) => {
  console.error(err);
  try {
    await mongoose.disconnect();
  } catch (e) {}
  process.exit(1);
});
