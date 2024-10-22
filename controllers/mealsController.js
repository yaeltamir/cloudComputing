// controllers/mealsController.js
const mealsModel = require('../models/mealsModel');

// פונקציה לטיפול בהוספת ארוחה
async function addMeal(req, res) {
   // const idUser=req.session.user.id
   const idUser=12346789//נועד בשביל שלא נצטרך להתחבר כל פעם מחדש
    const holiday="צריך לבדוק על בסיס התאריך מהשירות של הב-קאל"
    const Components="צריך לחשב על בסיס התמונה מהשירות של אימגה"

    const { kindOfMeal, date, time, imageUrl, sugarLevel } = req.body;

    // בדיקת תקינות הנתונים
    if (!idUser || !kindOfMeal || !date || !time) {
        return res.status(400).send('Missing required fields');
    }

   // f_time=formatTime(time)

    const meal = {
        idUser,
        kindOfMeal,
        date,
        time,
        holiday,
        Components,
        imageUrl,
        sugarLevel
    };

    // הוספת הארוחה למסד הנתונים
    const result = await mealsModel.addMeal(meal);

    if (result.success) {
        res.send('The meal was added successfully!' );
  //res.redirect('/resume/true');
//        res.render('resume',{ successMessage: 'the meal was added successfully!' })
    } else {
        res.status(500).send(`Error: ${result.error}`);
    }
}

function formatTime(inputTime) {
    // Split the input time and add ':00' for seconds if not provided
    return 
}



module.exports = {    
    addMeal
};
