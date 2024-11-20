const express = require('express');
const router = express.Router();
const mealsController = require('../controllers/mealsController');

// Route for the meals page - renders meals.ejs
router.get('/', (req, res) => {
    res.render('meals', {
        successMessage: req.session.message, // Success message from the session
        sugarPrediction: null,              // Placeholder for sugar prediction
        message: null,                       // Placeholder for additional messages
        userId: req.session.user.id,         // User ID from the session
        isRegistered: req.session.user.isRegistered // User registration status
    });
});

// Handle adding a meal
router.post('/add', mealsController.addMeal);

// Handle predicting sugar levels
router.post('/predict', mealsController.predictSugarLevel);

// Handle checking if a date is a holiday
router.post('/checkHoliday', mealsController.calculateIsHoliday);

// Handle calculating components and sugar level for a meal
router.post('/checkComponentsAndMealSugar', mealsController.calculateComponentsAndMealSugar);

module.exports = router;
