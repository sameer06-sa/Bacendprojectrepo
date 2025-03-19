const express = require('express');
const {
  signup,
  signin,
  updateSubscription,
  getUserDetailsByEmail,
  autoLogin, // Add this
} = require('../controllers/userController');
const { getAllUsers } = require('../controllers/userController');
const { signupValidator, signinValidator } = require('../validators/signupValidators');
const { validateRequest } = require('../middlewares/validationMiddleware');
const authenticateUser = require('../middlewares/authenticateUser');
const Notification = require('../models/notificationModels'); // Import the Notification model
const { getUsersBySubscriptionType } = require('../controllers/userController');

const router = express.Router();


// Helper function to create notifications
const createNotification = async (email, message, type) => {
  try {
    const notification = new Notification({ email, message, type });
    await notification.save();
    console.log('Notification created:', notification);
  } catch (error) {
    console.error('Failed to create notification:', error.message);
  }
};

// Signup route
router.post('/signup', signupValidator, validateRequest, async (req, res, next) => {
  try {
    await signup(req, res);

    // Create a notification for successful signup
    const { email } = req.body;
    const message = `Welcome ${email}! Your account has been successfully created.`;
    await createNotification(email, message, 'signup');
  } catch (error) {
    next(error);
  }
});

// Signin route
router.post('/signin', signinValidator, validateRequest, async (req, res, next) => {
  try {
    const response = await signin(req, res);

    // Create a notification for successful signin
    const { email } = req.body;
    const message = `Welcome back, ${email}! You have successfully signed in.`;
    await createNotification(email, message, 'signin');
  } catch (error) {
    next(error);
  }
});

// Fetch all users (requires authentication)
router.get('/all', getAllUsers);

// Get user details by email
router.get('/:email', authenticateUser, async (req, res, next) => {
  try {
    await getUserDetailsByEmail(req, res);

    // Create a notification for fetching user details
    const { email } = req.params;
    const message = `User details for ${email} were accessed.`;
    await createNotification(email, message, 'get_user_details');
  } catch (error) {
    next(error);
  }
});

// Update subscription
router.put('/subscription', authenticateUser, async (req, res, next) => {
  try {
    await updateSubscription(req, res);

    // Create a notification for subscription update
    const { email, subscription } = req.body;
    const message = `Your subscription has been updated to "${subscription}".`;
    await createNotification(email, message, 'subscription_update');
  } catch (error) {
    next(error);
  }
});


router.post('/auto-login', async (req, res, next) => {
  try {
    await autoLogin(req, res);

    // Create a notification for successful auto-login
    const { email } = req.body;
    const message = `Welcome back, ${email}! You have been automatically logged in.`;
    await createNotification(email, message, 'auto_login');
  } catch (error) {
    next(error);
  }
});

module.exports = router;





// Import the new function


// Get users by subscription type (FreeTrial or Organization)
router.get('/subscription/:type', async (req, res, next) => {
  try {
    await getUsersBySubscriptionType(req, res);

    // Create a notification for fetching users by subscription
    const { type } = req.params;
    const message = `Fetched users with the subscription type "${type}".`;
    await createNotification('admin@example.com', message, 'get_users_by_subscription');
  } catch (error) {
    next(error);
  }
});
