const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  referralCode: { type: String, unique: true },
  points: { type: Number, default: 0 },
  googleId: String,
  twitterId: String,
  appleId: String,
  accessToken: String,
  refreshToken: String,
  createdAt: { type: Date, default: Date.now },
});

const User = mongoose.model("User ", userSchema);
