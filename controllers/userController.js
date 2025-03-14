const {
  registerUser,
  authenticateUser,
  fetchUserDetailsByEmail,
  autoLoginUser, // Add this to the imports
} = require('../services/userServices'); // Import services for user logic

const User = require('../models/userModel');

// Signup Controller
exports.signup = async (req, res, next) => {
  try {
    const { fullName, email, password, mobile, country, state, companyName, designation } = req.body;

    // Validate input
    if (!fullName || !email || !password || !mobile || !country || !state || !companyName || !designation) {
      return res.status(400).json({
        success: false,
        message: 'Full Name, Email, Password, Mobile, Country, State, Company Name, and Designation are required.',
      });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid email format.',
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters long.',
      });
    }

    // Register user without subscription
    const user = await registerUser({ fullName, email, password, mobile, country, state, companyName, designation });

    res.status(201).json({
      success: true,
      message: 'User registered successfully. Subscription can be added later.',
      data: user,
    });
  } catch (error) {
    console.error('Error in signup:', error.message);
    next(error);
  }
};

// Signin Controller
exports.signin = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and Password are required.',
      });
    }

    const result = await authenticateUser(email, password);

    if (!result.success) {
      return res.status(401).json({
        success: false,
        message: result.message,
      });
    }

    res.status(200).json({
      success: true,
      message: 'User signed in successfully.',
      data: {
        user: result.user,
        token: result.token,
      },
    });
  } catch (error) {
    console.error('Error in signin:', error.message);
    next(error);
  }
};

// Update Subscription Controller
exports.updateSubscription = async (req, res, next) => {
  try {
    const { subscriptionType, durationInDays } = req.body;

    // Ensure subscriptionType and durationInDays are provided
    if (!subscriptionType || !durationInDays) {
      return res.status(400).json({
        success: false,
        message: 'subscriptionType and durationInDays are required.',
      });
    }

    // Validate durationInDays
    if (typeof durationInDays !== 'number' || durationInDays <= 0) {
      return res.status(400).json({
        success: false,
        message: 'durationInDays must be a positive number.',
      });
    }

    // Validate subscriptionType
    const validSubscriptionTypes = ['FreeTrial', 'Organization'];
    if (!validSubscriptionTypes.includes(subscriptionType)) {
      return res.status(400).json({
        success: false,
        message: `Invalid subscription type. Valid types are: ${validSubscriptionTypes.join(', ')}.`,
      });
    }

    // Extract userId from the authenticated request
    const userId = req.user._id;

    // Find the user
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found.',
      });
    }

    // Calculate subscription start and end dates
    const startDate = new Date();
    const endDate = new Date(startDate.getTime() + durationInDays * 24 * 60 * 60 * 1000);

    // Update user's subscription
    user.subscription = {
      type: subscriptionType,
      durationInDays,
      startDate,
      endDate,
      status: 'active',
    };

    // Save the updated user
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Subscription updated successfully.',
      data: user.subscription,
    });
  } catch (error) {
    console.error('Error in updateSubscription:', error.message);
    next(error);
  }
};

// Get User Details by Email Controller
exports.getUserDetailsByEmail = async (req, res, next) => {
  try {
    const { email } = req.params;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Email is required.',
      });
    }

    const user = await fetchUserDetailsByEmail(email);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found.',
      });
    }

    res.status(200).json({
      success: true,
      message: 'User details retrieved successfully.',
      data: {
        _id: user._id,
        fullName: user.fullName,
        email: user.email,
        mobile: user.mobile,
        subscription: user.subscription || null,
      },
    });
  } catch (error) {
    console.error('Error in getUserDetailsByEmail:', error.message);
    next(error);
  }
};



// Add this to the existing exports in userController.js
exports.autoLogin = async (req, res, next) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Email is required.',
      });
    }

    const result = await autoLoginUser(email);

    if (!result.success) {
      return res.status(401).json({
        success: false,
        message: result.message,
      });
    }

    res.status(200).json({
      success: true,
      message: 'Auto-login successful',
      data: {
        user: result.user,
        token: result.token,
      },
    });
  } catch (error) {
    console.error('Error in autoLogin:', error.message);
    res.status(500).json({
      success: false,
      message: 'Auto-login failed',
      error: error.message,
    });
  }
};




// Get Users by Subscription Type
exports.getUsersBySubscriptionType = async (req, res, next) => {
  try {
    const { type } = req.params;

    // Validate subscription type
    const validSubscriptionTypes = ['FreeTrial', 'Organization'];
    if (!validSubscriptionTypes.includes(type)) {
      return res.status(400).json({
        success: false,
        message: `Invalid subscription type. Valid types are: ${validSubscriptionTypes.join(', ')}.`,
      });
    }

    // Find users with the given subscription type
    const users = await User.find({ 'subscription.type': type });

    if (!users.length) {
      return res.status(404).json({
        success: false,
        message: `No users found with the subscription type "${type}".`,
      });
    }

    res.status(200).json({
      success: true,
      message: `Users with subscription type "${type}" retrieved successfully.`,
      data: users,
    });
  } catch (error) {
    console.error('Error in getUsersBySubscriptionType:', error.message);
    next(error);
  }
};

