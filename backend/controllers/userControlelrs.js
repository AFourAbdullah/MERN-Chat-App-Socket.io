const userModel = require("../models/userModel");
const bcrypt = require("bcryptjs");

const asyncHandler = require("express-async-handler");
const signupUser = asyncHandler(async (req, res, next) => {
  const { name, email, password, pic } = req.body;
  if (!name || !email || !password) {
    res.status(400);
    throw new Error("All fields are mandatory!");
  }
  const userExists = await userModel.findOne({ email });
  if (userExists) {
    res.status(400);
    throw new Error("Email already exists");
  }
  const hashPassword = await bcrypt.hash(password, 10);
  const newUser = await userModel.create({
    name,
    email,
    password: hashPassword,
    pic,
  });
  newUser.status = "Online";
  await newUser.save();
  res.status(201).json(newUser);
});
const loginUser = asyncHandler(async (req, res, next) => {
  const { email, password } = req.body;
  if (!email || !password) {
    res.status(400);
    throw new Error("All fields are mandatory!");
  }
  const userExists = await userModel.findOne({ email });
  if (!userExists) {
    res.status(400);
    throw new Error("User doesnot exists");
  }
  if (userExists && (await bcrypt.compare(password, userExists.password))) {
    userExists.status = "Online";
    await userExists.save();
    res.status(201).json(userExists);
  } else {
    res.status(401);
    throw new Error("Invalid email or password");
  }
});
module.exports = { signupUser, loginUser };
