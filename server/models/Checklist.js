const mongoose = require("mongoose");

const ChecklistSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  name:   { type: String, required: true },
}, { timestamps: true });

module.exports = mongoose.model("Checklist", ChecklistSchema);