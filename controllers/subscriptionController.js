const Subscription = require('../models/subscriptionModel');
const OrganizationRequest = require('../models/organizationRequestModel');
const User = require('../models/userModel');

// Valid subscription types
const validSubscriptionTypes = ['Free trial', 'Organization'];

// Allowed durations for Organization subscriptions
const allowedDurations = {
  "1 month": 1,
  "3 months": 3,
  "6 months": 6,
  "1 year": 12
};

// Function to check if a user already has an active subscription
const checkActiveSubscription = async (userId) => {
  const existingSubscription = await Subscription.findOne({ user: userId });
  if (existingSubscription) {
    return {
      success: false,
      message: 'You already have an active subscription.',
    };
  }
  return null; // No active subscription, proceed with creation
};

// Function to create a new subscription or request admin approval
const createSubscription = async (req, res) => {
  try {
    const { subscriptionType, duration } = req.body;
    const userId = req.user._id;

    // Validate subscription type
    if (!validSubscriptionTypes.includes(subscriptionType)) {
      return res.status(400).json({
        success: false,
        message: `Invalid subscription type. Allowed types: ${validSubscriptionTypes.join(', ')}.`,
      });
    }

    // Check for existing active subscription
    const activeSubscriptionError = await checkActiveSubscription(userId);
    if (activeSubscriptionError) {
      return res.status(400).json(activeSubscriptionError);
    }

    // Fetch user details to ensure the user exists
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    // If subscription type is "Organization", validate duration and send request to admin
    if (subscriptionType === 'Organization') {
      if (!allowedDurations[duration]) {
        return res.status(400).json({
          success: false,
          message: `Invalid duration. Allowed durations: ${Object.keys(allowedDurations).join(', ')}.`,
        });
      }

      // Check if a request is already pending
      const existingRequest = await OrganizationRequest.findOne({ user: userId, status: 'pending' });
      if (existingRequest) {
        return res.status(400).json({ success: false, message: 'Your request is already pending for approval.' });
      }

      // Create a new request for organization approval
      const newRequest = new OrganizationRequest({
        user: userId,
        userEmail: user.email,
        subscriptionType,
        duration, // Store duration in request
        status: 'pending',
        requestedAt: new Date(),
      });

      await newRequest.save();

      return res.status(201).json({
        success: true,
        message: 'Your organization request has been sent to the admin for approval.',
        request: newRequest,
      });
    }

    // For "Free Trial", default to 1-year subscription
    const endDate = new Date();
    endDate.setFullYear(endDate.getFullYear() + 1);

    const newSubscription = new Subscription({
      user: userId,
      subscriptionType,
      startDate: new Date(),
      endDate,
    });

    await newSubscription.save();

    res.status(201).json({
      success: true,
      message: `You have successfully subscribed to the ${subscriptionType} plan.`,
      subscription: newSubscription,
    });
  } catch (error) {
    console.error('Subscription error:', error);
    res.status(500).json({
      success: false,
      message: 'An error occurred while processing your subscription.',
    });
  }
};

// Function to update organization request status (approved/rejected)
const updateRequestStatus = async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  try {
    // Validate the ID format
    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({ success: false, message: 'Invalid request ID format.' });
    }

    const request = await OrganizationRequest.findById(id);
    if (!request) {
      return res.status(404).json({ success: false, message: 'Request not found' });
    }

    // If admin approves, create the subscription
    if (status === 'approved') {
      const user = await User.findById(request.user);
      if (!user) {
        return res.status(404).json({ success: false, message: 'User not found.' });
      }

      const months = allowedDurations[request.duration];
      const startDate = new Date();
      const endDate = new Date(startDate);
      endDate.setMonth(endDate.getMonth() + months);

      const newSubscription = new Subscription({
        user: user._id,
        subscriptionType: request.subscriptionType,
        startDate,
        endDate,
      });

      await newSubscription.save();
    }

    // Update the request status
    request.status = status;
    await request.save();

    res.status(200).json({ success: true, message: 'Request updated successfully.', request });
  } catch (error) {
    console.error('Error updating request:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

module.exports = { createSubscription, updateRequestStatus };
