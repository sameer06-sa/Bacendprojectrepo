const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./config/db'); // Import database connection function

// Load environment variables
dotenv.config();

const app = express();

// Enable CORS with enhanced configuration
app.use(
  cors({
    origin: [
      'https://userportal-five.vercel.app',
      'https://adminportal-wine.vercel.app',
      'http://localhost:3000', // Local backend
      'http://localhost:3001', // Local frontend (port 3001)
      'http://localhost:3002', // Additional local frontend (port 3002)
      'http://localhost:3003'
    ],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'], // Allowed HTTP methods
    allowedHeaders: ['Content-Type', 'Authorization'], // Allowed headers
    credentials: true, // Allow cookies and credentials
  })
);

// Handle preflight requests for all routes
app.options('*', cors());

// Middleware to parse JSON and URL-encoded bodies
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Logging middleware for request details
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  console.log('Headers:', req.headers);
  next();
});

// Route imports
const userRoutes = require('./routes/userRoutes');
const webAppRoutes = require('./routes/webAppRoutes');
const paymentRoutes = require('./routes/paymentRoutes');
const organizationRoutes = require('./routes/organizationRoutes');
const adminOrganizationRoutes = require('./routes/AdminOrganizationRoutes'); // ✅ Added Admin Organization Routes
const projectRoutes = require('./routes/projectRoutes');
const addUserRoutes = require('./routes/addUserRoutes');
const serviceRoutes = require('./routes/serviceRoutes');
const hubIngestRoutes = require('./routes/hubingestroutes');
const subscriptionRoutes = require('./routes/subscriptionRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const dataStoreRoutes = require('./routes/dataStoreRoutes');
const adminRoutes = require('./routes/adminRoutes');
const authRoutes = require('./routes/authRoutes');
const deploymentRoutes = require('./routes/deploymentRoutes'); // Deployment routes
const taskRoutes = require('./routes/taskRoutes'); // Task routes
const deploymentCircleRoutes = require('./routes/deploymentCircleRouter');
const supportRoutes = require('./routes/supportRoutes');

// Initialize database and start server
const initializeServer = async () => {
  try {
    // Connect to the database
    await connectDB();
    console.log('Database connected successfully.');

    // Register API routes
    app.use('/api/user', userRoutes);
    app.use('/api/webapp', webAppRoutes);
    app.use('/api/payment', paymentRoutes);
    app.use('/api/org', organizationRoutes);
    app.use('/api/admin-organization', adminOrganizationRoutes); // ✅ Added Admin Organization API
    app.use('/api/proj', projectRoutes);
    app.use('/api/add-user', addUserRoutes);
    app.use('/api', serviceRoutes);
    app.use('/api/hubingest', hubIngestRoutes);
    app.use('/api/subscriptions', subscriptionRoutes);
    app.use('/api/notifications', notificationRoutes);
    app.use('/api/datastore', dataStoreRoutes);
    app.use('/api/admin', adminRoutes); // Admin routes
    app.use('/api/auth', authRoutes);
    app.use('/api/deployments', deploymentRoutes); // Deployment routes
    app.use('/api/tasks', taskRoutes); // Task routes
    app.use('/api/deploymentCircles', deploymentCircleRoutes);
    app.use('/api/support', supportRoutes);
    app.use('/api/payment', paymentRoutes);

    // Health check route
    app.get('/', (req, res) => {
      res.status(200).send('Server is deployed and running successfully.');
    });

    // Handle undefined routes
    app.use((req, res, next) => {
      res.status(404).json({
        success: false,
        message: `Route not found: ${req.method} ${req.url}`,
      });
    });

    // Global error handler
    app.use((err, req, res, next) => {
      console.error('Global error handler triggered:', err);
      res.status(err.status || 500).json({
        success: false,
        message: err.message || 'Internal Server Error',
        ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
      });
    });

    // Start the server
    const PORT = process.env.PORT || 3000;
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Failed to initialize server:', error.message);
    process.exit(1);
  }
};

// Initialize the server
initializeServer();
