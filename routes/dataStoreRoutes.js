const express = require('express');
const router = express.Router();

// Import the controller correctly
const dataStoreController = require('../controllers/dataStoreController');
const { logNotification } = require('../middlewares/notificationLogger'); // Import the notification logger

// Import authentication middleware
const authenticateUser = require('../middlewares/authenticateUser');

// Define Routes
router.post('/', authenticateUser, dataStoreController.createDataStore);
router.get('/', authenticateUser, dataStoreController.getAllDataStore);

// Updated this line to use :id for fetching DataStore by _id
router.get('/:id', authenticateUser, dataStoreController.getDataStoreById); // Updated from :projectId to :id
router.put('/:id', authenticateUser, dataStoreController.updateDataStore);
router.delete('/:id', authenticateUser, dataStoreController.deleteDataStore);

// Export the router to use it in server.js
module.exports = router;
