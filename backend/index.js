const express = require("express");
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const { OAuth2Client } = require("google-auth-library");
const app = express();
app.use(express.json());

// MongoDB connection
mongoose.connect("mongodb://localhost:27017/referralSystem", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// User Schema
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

// Google OAuth Client
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// Validate Referral Code
app.get("/validate-referral/:code", async (req, res) => {
  const user = await User.findOne({ referralCode: req.params.code });
  if (user) {
    return res.status(200).send();
  }
  return res.status(404).send("Invalid referral code");
});

// Register User
app.post("/register", async (req, res) => {
  const { token, referralCode } = req.body;

  // Verify Google token
  const ticket = await client.verifyIdToken({
    idToken: token,
    audience: process.env.GOOGLE_CLIENT_ID,
  });
  const payload = ticket.getPayload();
  const email = payload.email;

  // Check if user already exists
  let user = await User.findOne({ email });
  if (!user) {
    // Create new user with a unique referral code
    const newReferralCode = generateReferralCode();
    user = new User({
      name: payload.name,
      email,
      referralCode: process.env.referralCode,
    });
    await user.save();

    // Allocate points if referral code is valid
    if (referralCode) {
      const referrer = await User.findOne({ referralCode });
      if (referrer) {
        referrer.points += 10; // Award points to the referrer
        await referrer.save();
      }
    }
    return res.status(201).send({
      message: "Registration successful!",
      referralCode: newReferralCode,
    });
  }
  return res.status(400).send("User  already exists.");
});

// Start the server
app.listen(5000, () => {
  console.log("Server is running on port 5000");
});
