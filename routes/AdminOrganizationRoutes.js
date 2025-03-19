const express = require("express");
const router = express.Router();
const {
  createOrganization,
  getAllOrganizations,
  getOrganizationByEmail,
  updateOrganization,
  deleteOrganization
} = require("../controllers/adminOrganizationController");


// Admin Routes
router.post("/create", createOrganization); // Create Organization
router.get("/all", getAllOrganizations); // Fetch all organizations
router.put("/update/:id", updateOrganization); // Update organization
router.delete("/delete/:id", deleteOrganization); // Delete organization

// User Route
router.get("/user/:email", getOrganizationByEmail); // Fetch organizations by user email

module.exports = router;
