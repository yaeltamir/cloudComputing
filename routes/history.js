// In routes.js
const express = require('express');
const router = express.Router();
const controller = require('../controllers/mealsController'); // Import the controller

// Route for displaying the graph
router.get('/', controller.showHistoryGraph);

module.exports = router;
