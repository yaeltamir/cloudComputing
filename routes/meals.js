// routes/mealsRoutes.js
const express = require('express');
const router = express.Router();
const mealsController = require('../controllers/mealsController');

// // תצוגת הוספת ארוחה
// router.get('/add', (req, res) => {
//     res.sendFile(__dirname + '/views/addMeal.html');
// });

// טיפול בהוספת ארוחה
router.post('/add', mealsController.addMeal);

module.exports = router;
