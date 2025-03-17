const express = require('express');
const { initiatePayment, paymentCallback } = require('../controllers/paymentController');
const { logNotification } = require('../middlewares/notificationLogger'); // Import notification logger

const router = express.Router();

// Payment initiation with notification
router.post('/initiate', async (req, res, next) => {
  try {
    const { email, amount } = req.body; // Get user email & payment amount
    await initiatePayment(req, res);

    // Log payment initiation notification
    await logNotification(email, `Payment of ₹${amount} has been initiated, Your free trial subscription has been updated. You now have 7 days of all-access.`, 'payment_initiated');

  } catch (error) {
    next(error);
  }
});

// Payment callback (success/failure)
router.post('/callback', async (req, res, next) => {
  try {
    const { email, transactionId, status } = req.body; // Get payment details
    await paymentCallback(req, res);

    // Log payment success or failure notification
    if (status === 'SUCCESS') {
      await logNotification(email, `Payment successful for Transaction ID: ${transactionId}.`, 'payment_success');
    } else {
      await logNotification(email, `Payment failed for Transaction ID: ${transactionId}.`, 'payment_failed');
    }

  } catch (error) {
    next(error);
  }
});

module.exports = router;
