const mongoose = require('mongoose');
const colors = require('colors');

mongoose.set('strictQuery', true);

module.exports.connectDB = async () => {
    try {
        const uri = process.env.NODE_ENV === "production" 
            ? process.env.MONGO_URI 
            : "mongodb://localhost:27017/invoicing";
        await mongoose.connect(uri);
        console.log("Database connected".green);
    } catch (error) {
        console.error("Database connection error:".red, error);
    }
};

module.exports.closeDatabase = async () => {
    try {
        await mongoose.connection.dropDatabase();
        console.log("Database dropped".yellow);
        await mongoose.disconnect();
        console.log("Database connection closed".yellow);
    } catch (error) {
        console.error("Error dropping database:".red, error);
    }
};

module.exports.clearDatabase = async () => {
    try {
        const collections = mongoose.connection.collections;
        for (const key in collections) {
            await collections[key].deleteMany();
        }
        console.log("All collections cleared".cyan);
    } catch (error) {
        console.error("Error clearing database:".red, error);
    }
};