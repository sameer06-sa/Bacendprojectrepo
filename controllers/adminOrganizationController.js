const AdminOrganization = require("../models/AdminOrganization");

// Create Organization (Admin Only)
exports.createOrganization = async (req, res) => {
  try {
    const { organizationName, details, contactNumber, email, paymentMethod } = req.body;
    const newOrganization = new AdminOrganization({ organizationName, details, contactNumber, email, paymentMethod });
    await newOrganization.save();
    res.status(201).json({ success: true, message: "Organization created successfully", data: newOrganization });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error creating organization", error: error.message });
  }
};

// Fetch All Organizations (Admin Only)
exports.getAllOrganizations = async (req, res) => {
  try {
    const organizations = await AdminOrganization.find();
    res.status(200).json({ success: true, data: organizations });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error fetching organizations", error: error.message });
  }
};

// Fetch Organization by User Email
exports.getOrganizationByEmail = async (req, res) => {
  try {
    const { email } = req.params;
    const organizations = await AdminOrganization.find({ email });
    res.status(200).json({ success: true, data: organizations });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error fetching organization", error: error.message });
  }
};

// Update Organization (Admin Only)
exports.updateOrganization = async (req, res) => {
  try {
    const { id } = req.params;
    const updatedOrg = await AdminOrganization.findByIdAndUpdate(id, req.body, { new: true });
    if (!updatedOrg) {
      return res.status(404).json({ success: false, message: "Organization not found" });
    }
    res.status(200).json({ success: true, message: "Organization updated successfully", data: updatedOrg });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error updating organization", error: error.message });
  }
};

// Delete Organization (Admin Only)
exports.deleteOrganization = async (req, res) => {
  try {
    const { id } = req.params;
    const deletedOrg = await AdminOrganization.findByIdAndDelete(id);
    if (!deletedOrg) {
      return res.status(404).json({ success: false, message: "Organization not found" });
    }
    res.status(200).json({ success: true, message: "Organization deleted successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error deleting organization", error: error.message });
  }
};
