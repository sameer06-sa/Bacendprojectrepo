const mongoose = require("mongoose");

const SupportSchema = new mongoose.Schema(
  {
    subject: { type: String, required: true },
    message: { type: String, required: true },
    status: { type: String, default: "open" }, // open, resolved
    response: { type: String, default: "" }, // Admin response
    createdAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Support", SupportSchema);
