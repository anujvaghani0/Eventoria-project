const mongoose = require("mongoose");
const MONGOURI = process.env.MONGOURI;
mongoose.connect(MONGOURI, { useNewUrlParser: true, useUnifiedTopology: true });
const db = mongoose.connection;
db.on("error", console.error.bind(console, "MongoDB connection error:"));

const userSchema = new mongoose.Schema({
  fname: {
    type: String,
    required: true,
    max: 30,
  },
  lname: {
    type: String,
    required: true,
    max: 30,
  },
  username: {
    type: String,
    required: true,
    max: 30,
    unique: true,
  },
  email: {
    type: String,
    required: true,
    max: 256,
    unique: true,
  },
  password: {
    type: String,
    required: true,
    max: 40,
  },
  regDate: {
    type: Date,
  },
  type: {
    type: String,
    required: true,
  },
});

module.exports = mongoose.model("User", userSchema, "register");
