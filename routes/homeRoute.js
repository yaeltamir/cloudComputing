const express = require('express');
const router = express.Router();
const mealsController = require('../controllers/mealsController'); // הנתיב שלך לבקר

// מסלול ל- /home שמפעיל את פונקציית הבקר
router.get('/', mealsController.getLastMeals, (req, res) => {
    const user = req.session.user;
    const userName = user ? user.name : 'Guest';

    // שליחת המשתנים ל-EJS
    res.render('home', {
        userName: userName,
        userId: user ? user.id : null,
        isRegistered: user ? user.isRegistered : false,
        lastThreeMeals: req.lastThreeMeals // ודא ש-req.lastThreeMeals נשלח לכאן
    });
});

module.exports = router;


