// // models/mealsModel.js
// const sql = require('mssql');
// const { checkHebcalDate } = require('./dateModel'); // ייבוא הפונקציה לבדיקה

// const config = {
//     user: 'yael_SQLLogin_1',
//     password: '65s55lgogc',
//     server: 'usersInformation.mssql.somee.com',
//     database: 'usersInformation',
//     options: {
//         encrypt: true,
//         trustServerCertificate: true
//     }
// };

// async function addMeal(meal) {
//     try {
//         // בדיקת אם מדובר ביום חג, שבת או חול המועד
//         const holidayCheck = await checkHebcalDate(new Date(meal.date));
//         let isHoliday = (holidayCheck === "holiday" || holidayCheck === "shabbat" || holidayCheck === "chol amoed") ? holidayCheck : "not holiday";

//         // חיבור למסד הנתונים
//         let pool = await sql.connect(config);
        
//         // הוספת רשומה לטבלה
//         await pool.request()
//             .input('idUser', sql.Int, meal.idUser)
//             .input('kindOfMeal', sql.NVarChar, meal.kindOfMeal)
//             .input('Date', sql.Date, meal.date)
//             .input('Time', sql.NVarChar, meal.time)
//             .input('holiday', sql.NVarChar, isHoliday) // תוצאת בדיקת החג
//             .input('Components', sql.NVarChar, meal.Components)
//             .input('imageUrl', sql.NVarChar, meal.imageUrl)
//             .input('sugarLevel', sql.Int, meal.sugarLevel)
//             .query(`INSERT INTO meals (idUser, kindOfMeal, Date, Time, isHoliday, Components, imageUrl, sugarLevel) 
//                     VALUES (@idUser, @kindOfMeal, @Date, @Time, @holiday, @Components, @imageUrl, @sugarLevel)`);

//         return { success: true };
//     } catch (err) {
//         console.log(err);
//         return { success: false, error: err.message };
//     }
// }

// module.exports = {
//     addMeal
// };

// models/mealsModel.js
const sql = require('mssql');

const axios = require('axios');

// Function to identify the type of day using the Hebcal API
async function checkHebcalDate(date) {
    // const year = date.getFullYear();
    // const month = date.getMonth() + 1; // Months in JavaScript are 0-indexed
    // const day = date.getDate();

    // const url = `https://www.hebcal.com/converter?cfg=json&gy=${year}&gm=${month}&gd=${day}&g2h=1`;
    
    // try {
    //     const response = await axios.get(url);
    //     const data = response.data;

    //     // Print out the full data for debugging purposes
    //     console.log("Hebcal API response:", data);

    //     // Check for different types of events
    //     if (data.events) {
    //         const events = data.events.map(event => event.toLowerCase());
    //         if (events.some(event => event.includes("shabbat"))) {
    //             return "Shabbat";
    //         } else if (events.some(event => event.includes("yom tov"))) {
    //             return "Holiday";
    //         } else if (events.some(event => event.includes("chol hamoed"))) {
    //             return "Chol Hamoed";
    //         }
    //     }
        
    //     return "Regular day";
    // } catch (error) {
    //     console.error("Error fetching from Hebcal API:", error);
    //     return "Unknown"; // Default value in case of an error
    // }

const dateStr = date.toISOString().substring(0, 10);
const url = `https://www.hebcal.com/hebcal?v=1&cfg=json&maj=on&min=on&mod=on&nx=on&ss=on&mf=on&c=on&s=on&start=${dateStr}&end=${dateStr};`;
  
try {
    const response = await axios.get(url);
    const data = response.data;

    console.log(data);

    // Check if there is a significant event on the date
    for (const item of data.items) {
        console.log(item);
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
            .input('Components', sql.NVarChar, meal.Components)
            .input('imageUrl', sql.NVarChar, meal.imageUrl)
            .input('sugarLevel', sql.Int, meal.sugarLevel)
            .query(`INSERT INTO meals (idUser, kindOfMeal, Date, Time, isHoliday, Components, imageUrl, sugarLevel) 
                    VALUES (@idUser, @kindOfMeal, @Date, @Time, @isHoliday, @Components, @imageUrl, @sugarLevel)`);

        return { success: true };
    } catch (err) {
        console.log(err);
        return { success: false, error: err.message };
    }
}

module.exports = { checkHebcalDate, addMeal};

