const mongoose = require("mongoose");

const AdminOrganizationSchema = new mongoose.Schema(
  {
    organizationName: { type: String, required: true },
    details: { type: String, required: true },
    contactNumber: { type: String, required: true }, // Removed `unique: true`
    email: { type: String, required: true }, // Removed `unique: true`
    paymentMethod: {
      type: String,
      required: true,
      enum: ["Card", "Online"], // Only allow these two values
    },
  },
  { timestamps: true }
);

// Ensure model is not compiled multiple times
module.exports =
  mongoose.models.AdminOrganization ||
  mongoose.model("AdminOrganization", AdminOrganizationSchema);
