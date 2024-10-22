// models/mealsModel.js
const sql = require('mssql');

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
        // חיבור למסד הנתונים
        let pool = await sql.connect(config);
        
        // הוספת רשומה לטבלה
        await pool.request()
            .input('idUser', sql.Int, meal.idUser)
            .input('kindOfMeal', sql.NVarChar, meal.kindOfMeal)
            .input('Date', sql.Date, meal.date)
            .input('Time', sql.NVarChar, meal.time)
            .input('holiday', sql.NVarChar, meal.holiday)
            .input('Components', sql.NVarChar, meal.Components)
            .input('imageUrl', sql.NVarChar, meal.imageUrl)
            .input('sugarLevel', sql.Int, meal.sugarLevel)
            .query(`INSERT INTO meals (idUser, kindOfMeal, Date, Time, isHoliday, Components, imageUrl, sugarLevel) 
                    VALUES (@idUser, @kindOfMeal, @Date, @Time, @holiday, @Components, @imageUrl, @sugarLevel)`);

        return { success: true };
    } catch (err) {
        console.log(err);
        return { success: false, error: err.message };
    }
}

module.exports = {
    addMeal
};
