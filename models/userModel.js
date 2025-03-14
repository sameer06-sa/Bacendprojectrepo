const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: [true, 'Full name is required'],
      trim: true,
      minlength: [2, 'Full name must be at least 2 characters long'],
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      trim: true,
      lowercase: true,
      match: [/.+\@.+\..+/, 'Please provide a valid email address'],
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [8, 'Password must be at least 8 characters long'],
    },
    mobile: {
      type: String,
      required: [true, 'Mobile number is required'],
      match: [/^\d{10}$/, 'Mobile number must be 10 digits'],
    },
    country: {
      type: String,
      required: [true, 'Country is required'],
    },
    state: {
      type: String,
      required: [true, 'State is required'],
    },
    companyName: {
      type: String,
      required: [true, 'Company name is required'],
    },
    designation: {
      type: String,
      required: [true, 'Designation is required'],
      enum: [
        'Software Developer',
        'Data Analyst',
        'Product Manager',
        'UI/UX Designer',
        'System Analyst',
        'Project Manager',
        'Business Analyst',
        'Others',
      ],
    },
    // 🔹 Added missing paymentTransactionId field
    paymentTransactionId: {
      type: String,
      unique: true,
      sparse: true, // Allows multiple users to have null values
    },
    subscription: {
      type: {
        type: String,
        enum: ['FreeTrial', 'Organization'],
        required: false,
      },
      durationInDays: {
        type: Number,
        required: false,
        min: [1, 'Duration must be at least 1 day'],
      },
      startDate: {
        type: Date,
        required: false,
      },
      endDate: {
        type: Date,
        required: false,
        validate: {
          validator: function (value) {
            return !this.subscription.startDate || value > this.subscription.startDate;
          },
          message: 'End date must be after start date',
        },
      },
      status: {
        type: String,
        enum: ['active', 'inactive'],
        default: 'inactive',
      },
    },
    projects: [
      {
        projectName: {
          type: String,
          required: [true, 'Project name is required'],
        },
        organizationName: {
          type: String,
          required: [true, 'Organization name is required'],
        },
        subscriptionType: {
          type: String,
          required: [true, 'Subscription type is required'],
        },
        createdAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    hubIngests: [
      {
        hubIngestId: { type: mongoose.Schema.Types.ObjectId, ref: 'HubIngest' },
        name: String,
        projectName: String,
        subscriptionType: String,
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model('User', UserSchema);
