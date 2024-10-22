const mongoose = require("mongoose");
let db;
async function connectDB() {
  if (db) return db;
  try {
    db = mongoose
      .connect(process.env.MONGODB_URL)
      .then(() => {
        console.log("Connected to MongoDB Atlas successfully");
      })
      .catch((error) => {
        console.error("Error connecting to MongoDB Atlas:", error);
      });
  } catch (error) {
    console.log("Something is wrong", error);
  }
}

module.exports = connectDB;
