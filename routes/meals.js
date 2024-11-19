
// routes/mealsRoutes.js
const express = require('express');
const router = express.Router();
const mealsController = require('../controllers/mealsController');

// ניתוב לדף ה-meals - meals.ejs
router.get('/', (req, res) => {
    res.render('meals',{ 
        successMessage: null,
        sugarPrediction:null,
        message:null,
        userId:req.session.user.id,isRegistered:req.session.user.isRegistered
    })
  
    });
    

// טיפול בהוספת ארוחה
router.post('/add', 
    mealsController.addMeal
);
router.post('/predict', mealsController.predictSugarLevel);

router.post('/checkHoliday',mealsController.calculateIsHoliday);
router.post('/checkComponentsAndMealSugar',mealsController.calculateComponentsAndMealSugar);


module.exports = router;