// const axios = require('axios');
// const crypto = require('crypto');
// const dotenv = require('dotenv');

// dotenv.config();

// const MERCHANT_ID = process.env.PHONEPE_MERCHANT_ID;
// const SALT_KEY = process.env.PHONEPE_SALT_KEY;
// const SALT_INDEX = process.env.PHONEPE_SALT_INDEX;
// const BASE_URL = process.env.PHONEPE_BASE_URL;

// // ✅ Initiate Payment
// exports.initiatePayment = async (req, res) => {
//   try {
//     const { amount } = req.body; // Amount in paise (100 INR = 10000 paise for ₹100)

//     if (!amount || isNaN(amount) || amount <= 0) {
//       return res.status(400).json({ success: false, message: 'Invalid amount' });
//     }

//     const payload = {
//       merchantId: MERCHANT_ID,
//       merchantTransactionId: `TXN_${Date.now()}`,
//       amount,
//       paymentInstrument: { type: 'UPI_INTENT' }, // Removed redirectUrl and callbackUrl
//     };

//     // Convert payload to Base64
//     const encodedPayload = Buffer.from(JSON.stringify(payload)).toString('base64');

//     // Generate SHA256 hash
//     const checksum = crypto.createHash('sha256').update(encodedPayload + SALT_KEY).digest('hex');
//     const finalXVerify = checksum + '###' + SALT_INDEX;

//     const response = await axios.post(`${BASE_URL}/pay`, { request: encodedPayload }, {
//       headers: {
//         'Content-Type': 'application/json',
//         'X-VERIFY': finalXVerify,
//         'X-MERCHANT-ID': MERCHANT_ID,
//       },
//     });

//     res.json(response.data);
//   } catch (error) {
//     console.error('Error in initiatePayment:', error);
//     res.status(500).json({ success: false, message: 'Payment initiation failed' });
//   }
// };

// // ✅ Verify Payment
// exports.verifyPayment = async (req, res) => {
//   try {
//     const { transactionId } = req.query;

//     if (!transactionId) {
//       return res.status(400).json({ success: false, message: "Transaction ID is required" });
//     }

//     const response = await axios.get(`${BASE_URL}/transaction/${transactionId}`, {
//       headers: { "X-MERCHANT-ID": MERCHANT_ID },
//     });

//     res.json(response.data);
//   } catch (error) {
//     console.error("Error in verifyPayment:", error);
//     res.status(500).json({ success: false, message: "Payment verification failed" });
//   }
// };
