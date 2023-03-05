const mongoose = require("mongoose");

const msgSchema = new mongoose.Schema({
  content: String,
  from: Object,
  date: String,
  to: String,
  socketid: String,
  time: String,
});

module.exports = mongoose.model("Message", msgSchema);
