const mongoose = require('mongoose');
const DbConnection = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URL );
        console.log("Database connected successfully");
    } catch (error) {
        console.log("Database connection failed", error);
    }
}
module.exports = {DbConnection};