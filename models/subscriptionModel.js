const mongoose = require('mongoose');

const SubscriptionSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  subscriptionType: { 
    type: String, 
    required: true, 
    enum: ['Free Trial', 'Organization'] 
  },
  duration: { 
    type: String, 
    enum: ['1 month', '3 months', '6 months', '1 year'], 
    required: function() { return this.subscriptionType === 'Organization'; } 
  },
  startDate: { type: Date, default: Date.now },
  endDate: { type: Date, required: true },
}, { timestamps: true });

module.exports = mongoose.model('Subscription', SubscriptionSchema);
