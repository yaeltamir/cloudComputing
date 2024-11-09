//קונטרולר אחראי לבדיקה ואימות של הנתונים לפני הכנסה למאגר הנתונים וגם מחזיר את הנתנוים המעובדים לויו כדי שיציג אותם אם צריך  או הודעה על הצלחה 

const axios = require('axios');
const mealsModel = require('../models/mealsModel'); // ייבוא של מודל הארוחות
const userModel = require('../models/userModel'); 

//מקבל נתונים מmeals.ejs ומעביר אותם למודל ומחזיר הודעה אם הארוחה נוספה בהצלחה
async function addMeal(req, res) {


    // const idUser=req.session.user.id
    const idUser = 123456789; // נועד בשביל שלא נצטרך להתחבר כל פעם מחדש
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
function kindOfMealToNumbers(kindOfMeal){
    if(kindOfMeal==="breakfast")
        return 0
    if(kindOfMeal==="lunch")
        return 1
    if(kindOfMeal==="dinner")
        return 2
    return 3
}

function isHolidayToNumbers(kindOfMeal){
    if(kindOfMeal==="YomTov")
        return 0
    if(kindOfMeal==="Shabbat")
        return 1
    if(kindOfMeal==="Chol HaMoed")
        return 2
    return 3
}
``
async function predictSugarLevel(req,res) {
    console.log(123)
    
    // const idUser=req.session.user.id
    const idUser = 123456789; // נועד בשביל שלא נצטרך להתחבר כל פעם מחדש
    const { kindOfMeal, date, imageUrl } = req.body;
    try {
        // שליפת הנתונים מהטבלאות השונות לפי ה-id
        const mealsData = await mealsModel.fetchMealDataById(idUser);
        const usersData = await userModel.fetchUserDataById(idUser);

        // בדיקה אם יש נתונים
        if (mealsData.length === 0 || usersData.length === 0) {
            throw new Error("לא נמצאו נתונים עבור ה-id המבוקש");
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

        
        console.log("תחזית לרמת הסוכר:", prediction[0]);
        predictionMessage=""
        if((prediction[0])>=100){
            predictionMessage="You should not eat this meal right now considering your sugar level.\nIf you still want to eat this then don't forget to add this meal to your meal history and measure the sugar afterwards by clicking submit"
        }else{
            predictionMessage="It is recommended that you eat this meal considering your sugar level.\nAfter eating the meal, don't forget to measure the sugar level and add it to your meal history by clicking the submit button"
        }
        console.log(predictionMessage)
        res.json({
            prediction: prediction[0],
            message: predictionMessage
        });
       // res.render('meals',{successMessage:"",sugarPrediction:prediction[0],message:predictionMessage})

    } catch (error) {
        console.error("שגיאה:", error.message);
    }
}



// // פונקציה להצגת הגרף
// async function showHistoryGraph(req, res) {
//     // const userId=req.session.user.id // לדוגמה, ניקח את ה-id מה-URL
//     const userId=123456789

//     try {
//         // שליפת הנתונים מהמודל
//         const meals = await mealsModel.fetchMealDataById(userId);
//         // console.log(`${meals[0].Date}T${meals[0].Time}:00`)
//         // console.log(meals[0])

//         //     // x: new Date(`${meal.Date.split("T")[0]}T${meal.Time.split("T")[1]}`),  // נניח שהעמודה 'date' מכילה תאריך ושעה
//         //     // y: meal.sugarLevel   // נניח שהעמודה 'bloodSugarLevel' מכילה את רמת הסוכר
//         // }));

//         const chartData = meals.map(meal => {
//             const datePart = new Date(meal.Date).toISOString().split("T")[0];  // "YYYY-MM-DD"
//             const timePart = new Date(meal.Time).toISOString().split("T")[1].slice(0, 5);  // "HH:MM"
        
//             const dateTimeString = `${datePart}T${timePart}:00`;
//             const combinedDateTime = new Date(dateTimeString).toISOString(); // הפיכת התאריך לפורמט ISO
        
//             return {
//                 x: combinedDateTime,  // התאריך והשעה בפורמט ISO
//                 y: meal.sugarLevel     // רמת הסוכר
//             };
//         });
        

//         // שליחה ל-view עם הנתונים
//         res.render('historyGraph', { chartData });

//     } catch (error) {
//         console.error('Error fetching meal data:', error);
//         res.status(500).send('Internal server error');
//     }
// }

// פונקציה להצגת היסטוריית רמות סוכר
async function showHistoryGraph(req, res) {
    /////////////////////////////////////////////////////////////////////לא ךשכוח לשנות את זה בסוף
    const userId = 123456789; // לדוגמה, נניח שה-ID נשלח דרך ה-URL
    const meals = await mealsModel.fetchMealDataById(userId);

    // יצירת מערכים לתאריכים ושעות, ורמות סוכר
    // const datesAndTimes = meals.map(meal => `${meal.Date} ${meal.Time}`);
    // console.log(datesAndTimes)

    // מיון הארוחות לפי תאריך ושעה
    meals.sort((a, b) => new Date(a.Date) - new Date(b.Date));

        // יצירת מערכים לתאריכים ורמות סוכר
        const dates = meals.map(meal => {
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
    console.log(dates)
    const sugarLevels = meals.map(meal => meal.sugarLevel);

    // שליחת הנתונים ל-EJS
    //res.render('historyGraph', { datesAndTimes, sugarLevels });
    res.render('historyGraph', { dates, sugarLevels });
}


module.exports = { addMeal,predictSugarLevel, showHistoryGraph };







