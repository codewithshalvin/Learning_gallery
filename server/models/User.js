const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: String,
  email: String,
  password: String,

  role: {
    type: String,
    enum: ["user", "admin"],
    default: "user"
  },

  // 🔥 NEW: Total Points
  points: {
    type: Number,
    default: 0
  },

  // 🔥 NEW: Daily Check-ins
  checkins: [
    {
      date: {
        type: String // format: YYYY-MM-DD
      }
    }
  ],
  avatarUrl: { type: String, default: "" },
});

module.exports = mongoose.model("User", userSchema);