const mongoose = require("mongoose");
require("dotenv").config();
const connectDB = async () => {
  try {
    mongoose
      .connect(process.env.MONGO_URI)
      .then((data) =>
        console.log(
          `connected to ${data.connection.host} at database ${data.connection.name}`
        )
      );
  } catch (error) {
    console.log(error);
    process.exit(1);
  }
};
module.exports = connectDB;
