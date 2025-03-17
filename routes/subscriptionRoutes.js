const express = require('express');
const router = express.Router();
const { createSubscription } = require('../controllers/subscriptionController');
const authenticateUser = require('../middlewares/authenticateUser'); // Ensure the user is authenticated
const User = require('../models/userModel'); // Ensure User model is imported



// Route to create a new subscription
router.post('/create', authenticateUser, createSubscription);

// Route to update subscription type using email
router.put('/update-subscription', async (req, res) => {
  const { email, subscription } = req.body;

  // Validate subscription type
  if (!['Free Trial', 'Organization'].includes(subscription)) {
    return res.status(400).json({
      error: `Invalid subscription type. Allowed types are: Free Trial, Organization.`,
    });
  }

  try {
    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Update the subscription type
    user.subscription = subscription;
    await user.save();

    res.status(200).json({ message: 'Subscription updated successfully', user });
  } catch (error) {
    res.status(500).json({ error: 'An error occurred while updating subscription' });
  }
});

// Route to fetch subscription details by email
router.get('/:email', async (req, res) => {
  const { email } = req.params;

  try {
    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Return user subscription details
    res.status(200).json({
      message: 'Subscription details fetched successfully',
      subscription: {
        name: user.name,
        email: user.email,
        subscriptionType: user.subscription, // Ensure the user model has a subscription field
        id: user._id,
        status: user.subscription ? 'Active' : 'Inactive',
      },
    });
  } catch (error) {
    res.status(500).json({ error: 'An error occurred while fetching subscription details' });
  }
});

module.exports = router;
