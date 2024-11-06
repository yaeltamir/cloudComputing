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





module.exports = { addMeal,predictSugarLevel };







