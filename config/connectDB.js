const mongoose = require("mongoose");

async function connectDB() {
  try {
    await mongoose.connect(process.env.MONGODB_URL);

    connection.on("connected", () => {
      console.log("Connect to DB");
    });
    connection.on("error", () => {
      console.log("something is wrong is mongodb", error);
    });
  } catch (error) {
    console.log("Something is wrong", error);
  }
}

module.exports = connectDB;
