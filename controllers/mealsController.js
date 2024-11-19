//קונטרולר אחראי לבדיקה ואימות של הנתונים לפני הכנסה למאגר הנתונים וגם מחזיר את הנתנוים המעובדים לויו כדי שיציג אותם אם צריך  או הודעה על הצלחה 

const axios = require('axios');
const mealsModel = require('../models/mealsModel'); // ייבוא של מודל הארוחות
const userModel = require('../models/userModel'); 

//מקבל נתונים מmeals.ejs ומעביר אותם למודל ומחזיר הודעה אם הארוחה נוספה בהצלחה
async function addMeal(req, res) 
{

    const idUser = req.session.user.id; 
    const { kindOfMeal, date, time, imageUrl, sugarLevel } = req.body;

    //check validity
    if (!idUser || !kindOfMeal || !date || !time) 
    {
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

function kindOfMealToNumbers(kindOfMeal)
{
    if(kindOfMeal==="breakfast")
        return 0
    if(kindOfMeal==="lunch")
        return 1
    if(kindOfMeal==="dinner")
        return 2
    return 3
}

function isHolidayToNumbers(kindOfMeal)
{
    if(kindOfMeal==="YomTov")
        return 0
    if(kindOfMeal==="Shabbat")
        return 1
    if(kindOfMeal==="Chol HaMoed")
        return 2
    return 3
}
``
async function predictSugarLevel(req,res)
 {
    const idUser=req.session.user.id
    const { kindOfMeal, date, imageUrl } = req.body;
    try {
        // שליפת הנתונים מהטבלאות השונות לפי ה-id
        const mealsData = await mealsModel.fetchMealDataById(idUser);
        const usersData = await userModel.fetchUserDataById(idUser);

        // בדיקה אם יש נתונים
        if (mealsData.length <20 || usersData.length === 0)
        {
            res.json({
                prediction: "ERROR",
                message: "There is not enough data for you so that we can predict the sugar level at the moment,\n we recommend that you enter more data before clicking this button"
            });
            return;
        }

        const user = usersData[0]  // יתכן שתצטרכי להתאים לפי אופי הנתונים


        // איחוד הנתונים
        const data = mealsData.map(meal => {
            
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
          isHolidayToNumbers(row.isHoliday), kindOfMealToNumbers(row.kindOfMeal), row.gender==="male"?1:2, row.age, row.weight,row.mealSugar
        ]);
        
        const labels = data.map(row => row.sugarLevel);
        
        // יצירת עץ החלטה ואימון
        const { DecisionTreeClassifier } = require('ml-cart');
        const decisionTree = new DecisionTreeClassifier();
        
        decisionTree.train(features, labels);
   
        const isHoliday=await mealsModel.checkHebcalDate(new Date(date))
        
        const totalSugar=await mealsModel.calculateTotalSugar(await mealsModel.tagImage(imageUrl))
    
        const newData = [[isHolidayToNumbers(isHoliday),kindOfMealToNumbers(kindOfMeal), usersData[0].gender==="male"?1:2,usersData[0].age ,usersData[0].weight,totalSugar]];  // התאמה לערכים חדשים

        const prediction = decisionTree.predict(newData);

        
        predictionMessage=""
        if((prediction[0])>=100){
            predictionMessage="You should not eat this meal right now considering your sugar level.\nIf you still want to eat this then don't forget to add this meal to your meal history and measure the sugar afterwards by clicking submit"
        }else{
            predictionMessage="It is recommended that you eat this meal considering your sugar level.\nAfter eating the meal, don't forget to measure the sugar level and add it to your meal history by clicking the submit button"
        }
        res.json({
            prediction: prediction[0],
            message: predictionMessage
        });

    } 
    catch (error) 
    {
        console.error("שגיאה:", error.message);
    }
}


// פונקציה להצגת היסטוריית רמות סוכר
async function showHistoryGraph(req, res) {
    const userId = req.session.user.id; // לדוגמה, נניח שה-ID נשלח דרך ה-URL
    const { startDate, endDate } = req.query; // שליפת תאריכים מהבקשה

    const meals = await mealsModel.fetchMealDataById(userId);

     // סינון הארוחות לפי טווח התאריכים אם ישנם תאריכים בבקשה
     const filteredMeals = meals.filter(meal => {
        const mealDate = new Date(meal.Date);
        const start = startDate ? new Date(startDate) : null;
        const end = endDate ? new Date(endDate) : null;

         // בדיקה אם התאריך של הארוחה נמצא בטווח המבוקש
         if (start && end) {
            return mealDate >= start && mealDate <= end;
        } else if (start) {
            return mealDate >= start;
        } else if (end) {
            return mealDate <= end;
        }
        return true; // אם אין תאריכים, מחזיר את כל הארוחות
    });

    // מיון הארוחות לפי תאריך ושעה
    filteredMeals.sort((a, b) => new Date(a.Date) - new Date(b.Date));

        // יצירת מערכים לתאריכים ורמות סוכר
        const dates = filteredMeals.map(meal => {
            const date = new Date(meal.Date);
            const day = String(date.getDate()).padStart(2, '0');
            const month = String(date.getMonth() + 1).padStart(2, '0'); // חודשים מתחילים מ-0
            const year = date.getFullYear();

            // הפקת השעה בפורמט "HH:MM"
            const time = meal.Time;
            const hours = String(time.getHours()).padStart(2, '0');
            const minutes = String(time.getMinutes()).padStart(2, '0');
            const formattedTime = `${hours}:${minutes}`;

            return `${day}/${month}/${year} ${formattedTime}`;
        });

    const sugarLevels = filteredMeals.map(meal => meal.sugarLevel);
       // הוספת התמונה לכל רשומה
    const mealImages = filteredMeals.map(meal => meal.imageUrl);
    
    // שליחת הנתונים ל-EJS
    res.render('historyGraph', { dates, sugarLevels,mealImages ,userId,isRegistered:req.session.user.isRegistered});
}


// פונקציה לשליפת שלושת הארוחות האחרונות
async function getLastMeals(req, res, next)
 {
    // בדיקה האם המשתמש קיים ב-session ויש לו מזהה
    if (!req.session.user || !req.session.user.id)
    {
        console.error('User is not logged in or user ID is missing');
        return res.status(400).send('User is not logged in or user ID is missing');
    }

    const userId = req.session.user.id;

    try {
        // שליפת הארוחות האחרונות מהמודל
        const meals = await mealsModel.fetchMealDataById(userId);

        // סינון ושליפה של 3 הארוחות האחרונות (ממוינות לפי תאריך)
        const lastThreeMeals = meals
            .sort((a, b) => new Date(b.Date) - new Date(a.Date))
            .slice(0, 3);

        // שליחה לתבנית עם הנתונים
        req.lastThreeMeals = lastThreeMeals;
        next(); // המשך לעיבוד הבקשה (מעביר ל-next middleware או handler)
    } catch (error) {
        console.error('Error fetching last meals:', error);
        res.status(500).send('Error fetching last meals');
    }
}

module.exports = { addMeal,predictSugarLevel, showHistoryGraph, getLastMeals }; 







