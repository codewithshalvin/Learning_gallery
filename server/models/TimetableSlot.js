const mongoose = require("mongoose");

const TimetableSlotSchema = new mongoose.Schema({
  userId:     { type: String, required: true },
  subject:    { type: String, required: true },
  day:        { type: String, required: true },
  startHour:  { type: String, required: true },
  endHour:    { type: String, required: true },
  color:      { type: Number, default: 0 },
  room:       { type: String, default: "" },
}, { timestamps: true });

module.exports = mongoose.model("TimetableSlot", TimetableSlotSchema);