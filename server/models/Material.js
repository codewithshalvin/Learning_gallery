const mongoose = require("mongoose");

const materialSchema = new mongoose.Schema({
  subjectId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Subject"
  },
  type: String, // note, link, pdf, image
  title: String,
  content: String, // note text OR link OR file URL
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model("Material", materialSchema);