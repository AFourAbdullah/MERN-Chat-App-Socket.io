const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const { isEmail } = require("validator");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "can not be blank"],
    },
    email: {
      type: String,
      required: [true, "can not be blank"],
      unique: true,
      index: true,
      validate: [isEmail, "Invalid Email"],
    },
    password: {
      type: String,
      required: [true, "can not be blank"],
    },
    pic: {
      type: String,
      required: true,
      default:
        "https://icon-library.com/images/anonymous-avatar-icon/anonymous-avatar-icon-25.jpg",
    },
    newMessages: {
      type: Object,
      default: {},
    },
    status: {
      type: String,
      default: "Offline",
    },
  },
  { minimize: false }
);

module.exports = mongoose.model("User", userSchema);
