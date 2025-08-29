const mongoose = require("mongoose");

const DbConnection = async () => {
  try {
    const uri =
      process.env.MONGODB_URL ||
      process.env.MONGODB_URI ||
      "mongodb://localhost:27017/medium_clone";

    if (process.env.NODE_ENV === "production") {
      mongoose.set("autoIndex", false);
    }

    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 5000,
    });
    console.log("Database connected successfully");
  } catch (error) {
    console.log("Database connection failed", error?.message || error);
    throw error;
  }
};

module.exports = { DbConnection };
