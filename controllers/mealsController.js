// נייבא את axios
const axios = require('axios');

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

    try {
        // הגדרת ערך רכיבי הארוחה לפי תוצאת הפונקציה
        const Components = await tagImage(imageUrl);

        // הצגת רכיבי הארוחה בקונסול כ-JSON מובנה
        //console.log(JSON.stringify(Components));

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
    } catch (error) {
        res.status(500).send(`Error processing the meal: ${error.message}`);
    }
}



// פונקציה לשליחת בקשה ל-Imagga עבור זיהוי פריטים בתמונה
async function tagImage(url) {
    try {
        // הגדרת פרטי האימות
        const auth = {
            username: 'acc_3d6329443943c3f',
            password: '331a767287a9f56dbeb1220036943268'
        };
        
        // שליחת בקשת GET ל-Imagga
        const response = await axios.get(`https://api.imagga.com/v2/tags`, {
            params: {
                image_url: url
            },
            auth: auth
        });

        // סינון התוצאות לרמת ביטחון של לפחות 97%
        const tags = response.data.result.tags.filter(tag => tag.confidence >= 75);
        
        return tags.map(tag => ({ tag: tag.tag.en, confidence: tag.confidence }));

    } catch (error) {
        console.error('Error tagging image:', error.message);
        throw error;
    }
}



// module.exports = { tagImage };

module.exports = { addMeal };







