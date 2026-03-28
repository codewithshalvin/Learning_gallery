const mongoose = require("mongoose");

const ChecklistItemSchema = new mongoose.Schema({
  listId:    { type: mongoose.Schema.Types.ObjectId, ref: "Checklist", required: true },
  text:      { type: String, required: true },
  completed: { type: Boolean, default: false },
  priority:  { type: String, enum: ["low", "medium", "high"], default: "medium" },
  dueDate:   { type: String, default: "" },
}, { timestamps: true });

module.exports = mongoose.model("ChecklistItem", ChecklistItemSchema);