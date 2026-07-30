const mongoose = require("mongoose");
require("dotenv").config();

const connectToDB = async () => {
  try {
    console.log("MONGO_URI:", process.env.MONGO_URI);

    await mongoose.connect(process.env.MONGO_URI);

    console.log("✅ Successfully connected to DB");
  } catch (error) {
    console.error("❌ Unable to connect DB");
    console.error(error);
  }
};

module.exports = connectToDB;