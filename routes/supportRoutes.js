const express = require("express");
const router = express.Router();
const Support = require("../models/Support");

// Submit a new support query
router.post("/", async (req, res) => {
  try {
    const { subject, message } = req.body;
    const newQuery = new Support({ subject, message });
    await newQuery.save();
    res.json({ success: true, message: "Query submitted successfully!" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Get all queries (for users and admins)
router.get("/", async (req, res) => {
  try {
    const queries = await Support.find();
    res.json(queries);
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Admin updates response and status
router.put("/:id", async (req, res) => {
  try {
    const { response, status } = req.body;
    await Support.findByIdAndUpdate(req.params.id, { response, status });
    res.json({ success: true, message: "Query updated successfully!" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
