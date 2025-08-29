#!/usr/bin/env node

const mongoose = require("mongoose");
require("dotenv").config();

const Post = require("../Models/Post");
const User = require("../Models/User");

async function run() {
  const uri =
    process.env.MONGODB_URL ||
    process.env.MONGODB_URI ||
    "mongodb://localhost:27017/medium_clone";
  await mongoose.connect(uri);
  console.log("Connected to DB");

 
  const results = await Promise.all([Post.syncIndexes(), User.syncIndexes()]);

  console.log("Indexes synced for Post and User");
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
