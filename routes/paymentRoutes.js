const express = require('express');
const { initiatePayment, paymentCallback } = require('../controllers/paymentController');

const router = express.Router();

router.post('/initiate', initiatePayment);
router.post('/callback', paymentCallback);

module.exports = router;