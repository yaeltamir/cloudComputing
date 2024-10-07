const express = require('express');
const app = express();
const port = 3000;

app.use(express.static('public/startbootstrap-personal-gh-pages'));

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});

const sql = require('mssql');

const config = {
    user: 'yael_SQLLogin_1', // שם המשתמש שלך
    password: '65s55lgogc',    // הסיסמה שלך
    server: 'usersInformation.mssql.somee.com', // השרת
    database: 'usersInformation', // שם מאגר הנתונים
    options: {
        encrypt: true, // אם דרוש SSL
        trustServerCertificate: true // לאישור תעודת SSL
    }
};

async function connectToDatabase() {
    try {
        const pool = await sql.connect(config);
        console.log('Connected to the database!');

        // שאילתא עם פרמטרים
        const query = 'INSERT INTO users (id, name, email, password, birthday, gender, age, height, weight) VALUES (@id, @name, @email, @password, @birthday, @gender, @age, @height, @weight)';
        
        const request = pool.request();
        request.input('id', sql.Int, 214654121);
        request.input('name', sql.VarChar, 'yael');
        request.input('email', sql.VarChar, 'yaeltamir46@gmail.com');
        request.input('password', sql.VarChar, '1111');
        request.input('birthday', sql.Date, '2004-10-21'); // בפורמט YYYY-MM-DD
        request.input('gender', sql.VarChar, 'female');
        request.input('age', sql.Int, 19);
        request.input('height', sql.Decimal(5, 2), 1.64);
        request.input('weight', sql.Decimal(5, 2), 56.0);

        const result = await request.query(query);
        console.log('Inserted user:', result.rowsAffected);

    } 
    catch (err) 
    {
        console.error('Database connection failed:', err);
    } 
    finally
    {
        sql.close(); // סגירת החיבור
    }
}

connectToDatabase();


