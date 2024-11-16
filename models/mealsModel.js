//המודל אחראי על כל מה שקשור על תקשורת עם מסד הנתונים בפועל כמו עדכון והכנסה לטבלה או חישוב נתון כדי להכניס אותו לטבלה
const sql = require('mssql');
const axios = require('axios');
//const { Sequelize } = require('sequelize');

//const sequelize = new Sequelize(config.database, config.user, config.password, config.options);

// פונקציה לשליחת בקשה ל-Imagga עבור זיהוי פריטים בתמונה
async function tagImage(url) {
  try {
      // הגדרת פרטי האימות
      const auth = {
          username: 'acc_c06b1482838e00b',
          password: 'af30770f981a0eda4a2a299fe081142a'
      };
      
      // שליחת בקשת GET ל-Imagga
      const response = await axios.get(`https://api.imagga.com/v2/tags`, {
          params: {
              image_url: url
          },
          auth: auth
      });

      // סינון התוצאות לרמת ביטחון של לפחות 97%
      const tags = response.data.result.tags.filter(tag => tag.confidence >= 70);
      
      return tags.map(tag => ({ tag: tag.tag.en, confidence: tag.confidence }));

  } catch (error) {
      console.error('Error tagging image:', error.message);
      throw error;
  }
}

// פונקציה לשליפת כמות הסוכר של רכיב יחיד
async function getSugarContent(ingredient) 
{
  try {
    const response = await axios.get(`https://api.nal.usda.gov/fdc/v1/foods/search?query=${ingredient.tag}&api_key=ihExc60qvApvmTjPT1FlaZ2TTYBjTbqFGeh3GRLO`);
    const foodData = response.data.foods[0];
  
    // בדיקה האם foodNutrients קיים ומציאת רמת הסוכר
    const sugarContent = foodData.foodNutrients
      ? foodData.foodNutrients.find(nutrient => nutrient.nutrientName === 'Total Sugars')
      : null;
  
    let sugarValue = 0; // ברירת מחדל לערך סוכר
  
    if (sugarContent && !isNaN(sugarContent.value)) {
      sugarValue = parseFloat(sugarContent.value);
      console.log(`תכולת הסוכר: ${sugarValue} ${sugarContent.unitName}`);
    } else {
      console.log("לא נמצאה תכולת סוכר או הערך אינו מספר.");
    }
  
    // בדוק אם sugarValue הוא מספר חוקי לפני שליחתו
    if (typeof sugarValue === 'number' && !isNaN(sugarValue)) {
      // כאן אתה יכול לשלוח את sugarValue ל-API שלך
      console.log(`ערך הסוכר לשליחה: ${sugarValue}`);
      // לדוגמה:
      // await sendToApi(sugarValue);
    } else {
      console.error("ערך הסוכר אינו תקין, לא ניתן לשלוח.");
    }
  
    return sugarValue;
  } catch (error) {
    console.error(`Error fetching sugar content for ${ingredient.tag}:`, error.message);
    return null;
  }
  
  }
  

// פונקציה לחישוב כמות הסוכר הכוללת
async function calculateTotalSugar(components) {
  let totalSugar = 0;
  for (const component of components) {
      const sugar = await getSugarContent(component);
      totalSugar += sugar;
  }
  console.log(totalSugar);
  return totalSugar;
}

// Function to identify the type of day using the Hebcal API
async function checkHebcalDate(date) 
{
 
const dateStr = date.toISOString().substring(0, 10);
const url = `https://www.hebcal.com/hebcal?v=1&cfg=json&maj=on&min=on&mod=on&nx=on&ss=on&mf=on&c=on&s=on&start=${dateStr}&end=${dateStr};`;
  
try {
    const response = await axios.get(url);
    const data = response.data;

    // Check if there is a significant event on the date
    for (const item of data.items) {
      if (item.yomtov === true) {
        return "YomTov";
      } else if (item.title.includes("Shabbat")) {
        return "Shabbat";
      } else if (item.title.includes("CH’’M")) { // Adding check for Chol HaMoed
        return "Chol HaMoed";
      } else if(item.category === "holiday"){
        return "Holiday";
      }
    }

    // If there's no special event, it's a regular day
    return "Regular Day";
  } catch (error) {
    console.error("Error fetching data:", error);
    return "Error";
  }
}

const config = {
    user: 'yael_SQLLogin_1',
    password: '65s55lgogc',
    server: 'usersInformation.mssql.somee.com',
    database: 'usersInformation',
    options: {
        encrypt: true,
        trustServerCertificate: true
    }
};

async function addMeal(meal) {
    try {
        // בדיקת אם מדובר ביום חג, שבת או חול המועד
        const holiday = await checkHebcalDate(new Date(meal.date));
        console.log(holiday);
        // חיבור למסד הנתונים
        let pool = await sql.connect(config);

                //להעביר שהמודל יחשב את זה
        // הגדרת ערך רכיבי הארוחה לפי תוצאת הפונקציה
        const components = await tagImage(meal.imageUrl);

         // חישוב כמות הסוכר הכוללת של כל הרכיבים
         const totalSugar = await calculateTotalSugar(components);
        // הוספת רשומה לטבלה
        await pool.request()
            .input('idUser', sql.Int, meal.idUser)
            .input('kindOfMeal', sql.NVarChar, meal.kindOfMeal)
            .input('Date', sql.Date, meal.date)
            .input('Time', sql.NVarChar, meal.time)
            .input('isHoliday', sql.NVarChar, holiday)
            .input('Components', sql.NVarChar, JSON.stringify(components))
            .input('imageUrl', sql.NVarChar, meal.imageUrl)
            .input('sugarLevel', sql.Int, meal.sugarLevel)
            .input('mealSugar', sql.Decimal(10, 2), totalSugar)
            .query(`INSERT INTO meals (idUser, kindOfMeal, Date, Time, isHoliday, Components, imageUrl, sugarLevel, mealSugar) 
                    VALUES (@idUser, @kindOfMeal, @Date, @Time, @isHoliday, @Components, @imageUrl, @sugarLevel, @mealSugar)`);

        return { success: true };
    } catch (err) {
        console.log(err);
        return { success: false, error: err.message };
    }
}



// //חיזוי רמת סוכר
// const { DecisionTreeClassifier } = require('ml-cart');

// // דוגמה של נתוני אימון
// //לשנות את זה כך שזה יהיה על סמך הנתונים מ2 הטבלאות 
// const trainingData = [
//     { age: 30, weight: 70, exercise: 'yes', sugarLevel: 'normal' },
//     { age: 45, weight: 85, exercise: 'no', sugarLevel: 'high' },
//     { age: 50, weight: 90, exercise: 'no', sugarLevel: 'high' },
//     { age: 25, weight: 65, exercise: 'yes', sugarLevel: 'normal' },
//     // ... הוסף עוד נתוני אימון
// ];

// //לשים לב שאם הנתון לא מספרי אז לעשות שזה יהיה 0 1 2  וכו
// // הכנת הנתונים לפורמט המתאים למודל
// const features = trainingData.map(item => [item.age, item.weight, item.exercise === 'yes' ? 1 : 0]);// הנתונים שעוזרים לחזות
// const labels = trainingData.map(item => item.sugarLevel); //מה שרוצים לחזות לפי הקיים

// // יצירת עץ החלטה ואימון המודל
// const classifier = new DecisionTreeClassifier();
// classifier.train(features, labels);

// // נתונים חדשים לחיזוי
// const newPatient = [40, 80, 0]; // 0 אומר שאין פעילות גופנית

// // חיזוי רמת הסוכר על סמך נתונים חדשים
// const prediction = classifier.predict([newPatient]);

// console.log(`Predicted sugar level: ${prediction[0]}`);

// שליפת נתונים מהטבלה meals עבור id מסוים - כל השורות המתאימות
async function fetchMealDataById(id) {
  try {
    // התחברות למסד הנתונים
    await sql.connect(config);

    // שאילתת SELECT לשליפת הנתונים
    const result = await sql.query`
        SELECT *
        FROM meals
        WHERE idUser = ${id}`;

  
    // החזרת התוצאות
    return result.recordset;
} catch (err) {
    console.error('Database query error:', err);
    throw err;
} finally {
    // ניתוק החיבור למסד הנתונים
    await sql.close();
}

}


module.exports = { checkHebcalDate, addMeal, calculateTotalSugar, fetchMealDataById,tagImage,};


