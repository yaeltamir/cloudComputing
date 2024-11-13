// בroutes.js
const express = require('express');
const router = express.Router();
const controller = require('../controllers/mealsController'); // ייבוא הבקר

// נתיב לגרף
router.get('/', controller.showHistoryGraph);

// הגדרת ה-Route לעמוד היסטוריית הגרפים עם אפשרות לסינון תאריכים
router.get('/historyGraph', controller.showHistoryGraph);

module.exports = router;