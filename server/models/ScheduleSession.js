const mongoose = require("mongoose");

const ScheduleSessionSchema = new mongoose.Schema({
  userId:   { type: String, required: true },
  title:    { type: String, required: true },
  date:     { type: String, required: true },
  time:     { type: String, default: "" },
  subject:  { type: String, default: "" },
  duration: { type: Number, default: 30 },
  priority: { type: String, enum: ["low", "medium", "high"], default: "medium" },
  notes:    { type: String, default: "" },
}, { timestamps: true });

module.exports = mongoose.model("ScheduleSession", ScheduleSessionSchema);