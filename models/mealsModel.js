const sql = require('mssql');

const axios = require('axios');


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
        // הוספת רשומה לטבלה
        await pool.request()
            .input('idUser', sql.Int, meal.idUser)
            .input('kindOfMeal', sql.NVarChar, meal.kindOfMeal)
            .input('Date', sql.Date, meal.date)
            .input('Time', sql.NVarChar, meal.time)
            .input('isHoliday', sql.NVarChar, holiday)
            .input('Components', sql.NVarChar, JSON.stringify(meal.Components))
            .input('imageUrl', sql.NVarChar, meal.imageUrl)
            .input('sugarLevel', sql.Int, meal.sugarLevel)
            .input('mealSugar', sql.Decimal(10, 2), meal.mealSugar)
            .query(`INSERT INTO meals (idUser, kindOfMeal, Date, Time, isHoliday, Components, imageUrl, sugarLevel, mealSugar) 
                    VALUES (@idUser, @kindOfMeal, @Date, @Time, @isHoliday, @Components, @imageUrl, @sugarLevel, @mealSugar)`);

        return { success: true };
    } catch (err) {
        console.log(err);
        return { success: false, error: err.message };
    }
}

module.exports = { checkHebcalDate, addMeal, calculateTotalSugar};


