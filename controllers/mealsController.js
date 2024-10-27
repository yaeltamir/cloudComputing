// controllers/mealsController.js
const mealsModel = require('../models/mealsModel'); // ייבוא של מודל הארוחות

// פונקציה לטיפול בהוספת ארוחה
async function addMeal(req, res) {

    // const idUser=req.session.user.id
    const idUser = 12346789; // נועד בשביל שלא נצטרך להתחבר כל פעם מחדש
    const { kindOfMeal, date, time, imageUrl, sugarLevel } = req.body;

    // בדיקת תקינות הנתונים
    if (!idUser || !kindOfMeal || !date || !time) {
        return res.status(400).send('Missing required fields');
    }

    // הגדרת ערך רכיבי הארוחה כרגע לדוגמה
    const Components="צריך לחשב על בסיס התמונה מהשירות של אימגה";

    // בניית אובייקט הארוחה
    const meal = {
        idUser,
        kindOfMeal,
        date,
        time,
        imageUrl,
        sugarLevel,
        Components
    };

    // הוספת הארוחה עם קריאת הפונקציה שבודקת את החג בתוך המודל
    const result = await mealsModel.addMeal(meal);

    if (result.success) {
        res.send('The meal was added successfully!');
    } else {
        res.status(500).send(`Error: ${result.error}`);
    }
}

module.exports = { addMeal };







