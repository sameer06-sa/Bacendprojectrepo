const express = require('express');
const router = express.Router();

// Import the controller correctly without extra spaces
const hubIngestController = require('../controllers/hubingest controller'); // Ensure no space between 'hubIngest' and 'Controller'

// Import authentication middleware
const authenticateUser = require('../middlewares/authenticateUser');


// Define Routes
router.post('/', authenticateUser, hubIngestController.createHubIngest);
router.get('/', authenticateUser, hubIngestController.getAllHubIngest);
router.get('/:userId', authenticateUser, hubIngestController.getHubIngestByUserId);
router.put('/:id', authenticateUser, hubIngestController.updateHubIngest);
router.delete('/:id', authenticateUser, hubIngestController.deleteHubIngest);

// Export the router to use it in server.js
module.exports = router;
