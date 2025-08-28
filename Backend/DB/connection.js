const mongoose = require('mongoose');

const DbConnection = async () => {
  try {
    const uri = process.env.MONGODB_URL || 'mongodb://localhost:27017/medium_clone';
    await mongoose.connect(uri);
    console.log('Database connected successfully');
  } catch (error) {
    console.log('Database connection failed', error?.message || error);
  }
};

module.exports = { DbConnection };