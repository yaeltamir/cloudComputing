//קונטרולר אחראי לבדיקה ואימות של הנתונים לפני הכנסה למאגר הנתונים וגם מחזיר את הנתנוים המעובדים לויו כדי שיציג אותם אם צריך  או הודעה על הצלחה 

const axios = require('axios');
const mealsModel = require('../models/mealsModel'); // ייבוא של מודל הארוחות
const userModel = require('../models/userModel'); 

//מקבל נתונים מmeals.ejs ומעביר אותם למודל ומחזיר הודעה אם הארוחה נוספה בהצלחה
async function addMeal(req, res) {

    // const idUser=req.session.user.id
    const idUser = 12346789; // נועד בשביל שלא נצטרך להתחבר כל פעם מחדש
    const { kindOfMeal, date, time, imageUrl, sugarLevel } = req.body;

    //check validity
    if (!idUser || !kindOfMeal || !date || !time) {
        return res.status(400).send('Missing required fields');
    }

    

        const meal = {
            idUser,
            kindOfMeal,
            date,
            time,
            imageUrl,
            sugarLevel
        };

        const result = await mealsModel.addMeal(meal);

        if (result.success) {
            //פה  צריך לשנות שתקפוץ הודעה ולא לעשות סנד
            res.send('The meal was added successfully!');  
        } else {
            res.status(500).send(`Error: ${result.error}`);
        }

}

async function predictSugarLevel(id) {
    try {
        // שליפת הנתונים מהטבלאות השונות לפי ה-id
        const mealsData = await mealsModel.fetchMealDataById(id);
        const usersData = await userModel.fetchUserDataById(id);

        // בדיקה אם יש נתונים
        if (mealsData.length === 0 || usersData.length === 0) {
            throw new Error("לא נמצאו נתונים עבור ה-id המבוקש");
        }

        // איחוד הנתונים
        const data = mealsData.map(meal => {
            const user = usersData.find(u => u.idUser === id);  // יתכן שתצטרכי להתאים לפי אופי הנתונים
            return {
                isHoliday: meal.isHoliday,
                kindOfMeal: meal.kindOfMeal,
                gender: user.gender,
                age: user.age,
                weight: user.weight,
                mealSugar: meal.mealSugar,
                sugarLevel:meal.sugarLevel
            };
        });

        // הכנת התכונות והלייבלים
        const features = data.map(row => [
            row.isHoliday, row.kindOfMeal, row.gender, row.age, row.weight,row.mealSugar
        ]);
        const labels = data.map(row => row.sugarLevel);

        // יצירת עץ החלטה ואימון
        const { DecisionTreeClassifier } = require('ml-cart');
        const decisionTree = new DecisionTreeClassifier();
        decisionTree.train(features, labels);

        //////נשנה אל תדאגי
        // תחזית לדוגמה עם נתונים חדשים
        const newData = [[0, 1, 1, 25, 65]];  // התאמה לערכים חדשים
        const prediction = decisionTree.predict(newData);

        console.log("תחזית לרמת הסוכר:", prediction[0]);

    } catch (error) {
        console.error("שגיאה:", error.message);
    }
}





module.exports = { addMeal,predictSugarLevel };







