// בroutes.js
const express = require('express');
const router = express.Router();
const controller = require('../controllers/mealsController'); // ייבוא הבקר

// נתיב לגרף
router.get('/', controller.showHistoryGraph);

module.exports = router;