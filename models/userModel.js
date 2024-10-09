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

// פונקציה לשמירת משתמש חדש בבסיס הנתונים
async function saveUser(userData) {
    try {
        const pool = await sql.connect(config);
        console.log('Connected to the database!');

        const query = 'INSERT INTO users (id, name, email, password, birthday, gender, age, height, weight) VALUES (@id, @name, @email, @password, @birthday, @gender, @age, @height, @weight)';
        
        const request = pool.request();
        request.input('id', sql.Int, userData.id);
        request.input('name', sql.VarChar, userData.name);
        request.input('email', sql.VarChar, userData.email);
        request.input('password', sql.VarChar, userData.password);
        request.input('birthday', sql.Date, userData.birthday);
        request.input('gender', sql.VarChar, userData.gender);
        request.input('age', sql.Int, userData.age);
        request.input('height', sql.Decimal(5, 2), userData.height);
        request.input('weight', sql.Decimal(5, 2), userData.weight);

        const result = await request.query(query);
        console.log('Inserted user:', result.rowsAffected);
    } catch (err) {
        console.error('Database connection failed:', err);
    } finally {
        sql.close();
    }
}

module.exports = { saveUser };
