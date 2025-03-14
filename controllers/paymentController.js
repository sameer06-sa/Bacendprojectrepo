const crypto = require('crypto');
const axios = require('axios');
const { v4: uuidv4 } = require('uuid');
const User = require('../models/userModel');

// PhonePe Sandbox Credentials (from .env)
const MERCHANT_ID = process.env.PHONEPE_MERCHANT_ID;
const MERCHANT_KEY = process.env.PHONEPE_MERCHANT_KEY;
const PHONEPE_PAY_URL = process.env.PHONEPE_BASE_URL;
const PHONEPE_STATUS_URL = process.env.PHONEPE_STATUS_URL;
const REDIRECT_URL = process.env.REDIRECT_URL; // Ensure this is correct

exports.initiatePayment = async (req, res) => {
  try {
    const { email, amount } = req.body;

    // Set default amount to ₹5 if not provided
    const paymentAmount = amount || 5;

    // Validate email and amount
    if (!email || paymentAmount < 0.01) {
      return res.status(400).json({ error: 'Invalid email or amount' });
    }

    const transactionId = uuidv4();

    // Find and update the user by email
    const user = await User.findOneAndUpdate(
      { email },
      { $set: { paymentTransactionId: transactionId } },
      { new: true }
    );

    if (!user) {
      console.error(`Error: User not found while setting transaction ID. Email: ${email}`);
      return res.status(400).json({ error: 'User not found' });
    }

    console.log("Updated User:", user);

    // Prepare payment payload
    const payload = {
      merchantId: MERCHANT_ID,
      merchantTransactionId: transactionId,
      amount: paymentAmount * 100, // Convert to paise (₹5 = 500 paise)
      merchantUserId: user._id.toString(), // Using MongoDB ObjectId
      redirectUrl: REDIRECT_URL, // ✅ Ensure this is correct
      redirectMode: 'POST',
      paymentInstrument: { type: 'PAY_PAGE' },
      mobileNumber: "9999999999" // Mandatory for sandbox
    };

    const base64Payload = Buffer.from(JSON.stringify(payload)).toString('base64');
    const checksumString = `${base64Payload}/pg/v1/pay${MERCHANT_KEY}`;
    const checksum = crypto.createHash('sha256').update(checksumString).digest('hex') + '###1';

    const response = await axios.post(PHONEPE_PAY_URL, {
      request: base64Payload
    }, {
      headers: {
        'X-VERIFY': checksum,
        'Content-Type': 'application/json',
        'X-MERCHANT-ID': MERCHANT_ID
      }
    });

    res.json({
      paymentUrl: response.data.data.instrumentResponse.redirectInfo.url,
      transactionId
    });

  } catch (error) {
    console.error('Payment initiation error:', error.response?.data || error.message);
    res.status(500).json({ 
      error: 'Payment initiation failed',
      details: error.response?.data || error.message 
    });
  }
};

exports.paymentCallback = async (req, res) => {
  try {
    console.log("📥 Received Callback:", req.body);

    const transactionId = req.body.merchantTransactionId || req.body.transactionId;
    if (!transactionId) {
      console.error("❌ Transaction ID missing in callback!");
      return res.status(400).json({ error: "Transaction ID missing in callback" });
    }

    console.log("🔎 Looking for transaction ID:", transactionId);

    // Generate checksum for status verification
    const statusString = `/pg/v1/status/${MERCHANT_ID}/${transactionId}${MERCHANT_KEY}`;
    const statusChecksum = crypto.createHash('sha256').update(statusString).digest('hex') + '###1';

    const statusResponse = await axios.get(
      `${PHONEPE_STATUS_URL}/pg/v1/status/${MERCHANT_ID}/${transactionId}`,
      {
        headers: {
          'X-VERIFY': statusChecksum,
          'X-MERCHANT-ID': MERCHANT_ID
        }
      }
    );

    console.log("🔄 Payment Status Response:", statusResponse.data);

    if (statusResponse.data.code === 'PAYMENT_SUCCESS') {
      const user = await User.findOne({ paymentTransactionId: transactionId });
      if (!user) {
        console.error("❌ User not found for this transaction:", transactionId);
        return res.status(404).json({ error: "User not found for this transaction" });
      }

      console.log("✅ User found:", user);

      // Update subscription
      const startDate = new Date();
      const endDate = new Date();
      endDate.setDate(startDate.getDate() + 7);

      user.subscription = {
        type: 'FreeTrial',
        durationInDays: 7,
        startDate,
        endDate,
        status: 'active'
      };

      await user.save();
      console.log("✅ Subscription updated successfully!");

      return res.redirect(process.env.SUCCESS_URL);
    }

    console.error("❌ Payment failed or not completed.");
    res.redirect(process.env.FAILURE_URL);

  } catch (error) {
    console.error('Payment callback error:', error.response?.data || error.message);
    res.status(500).json({ 
      error: 'Payment verification failed',
      details: error.response?.data || error.message 
    });
  }
};
