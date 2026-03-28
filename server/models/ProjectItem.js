const mongoose = require("mongoose");

const projectItemSchema = new mongoose.Schema(
  {
    projectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Project",
      required: true
    },

    name: {
      type: String,
      required: true
    },

    type: {
      type: String,
      enum: ["link", "image", "pdf", "doc", "note"],
      required: true
    },

    content: {
      type: String,
      default: ""
    },

    file: {
      type: String,
      default: ""
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("ProjectItem", projectItemSchema);