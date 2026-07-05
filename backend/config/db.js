const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    await mongoose.connect("mongodb://127.0.0.1:27017/internalCredentialManager");
    console.log("MongoDB connected ✅");
    console.log("Connected DB:", mongoose.connection.name);
  } catch (error) {
    console.error("MongoDB connection failed ❌", error.message);
    process.exit(1);
  }
};

module.exports = connectDB;
