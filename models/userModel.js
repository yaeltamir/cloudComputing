// Importing required library for SQL Server connection
const sql = require('mssql');

// Configuration object for connecting to the database
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

// Function to calculate age from a given birthdate
function age(birthDate) 
{
    const today = new Date();
    const birth = new Date(birthDate);

    let age = today.getFullYear() - birth.getFullYear();

    // Check if the birthday has passed this year
    const monthDifference = today.getMonth() - birth.getMonth();
    const dayDifference = today.getDate() - birth.getDate();

    if (monthDifference < 0 || (monthDifference === 0 && dayDifference < 0)) {
        age--;
    }

    return age;
}

// Function to save a new user in the database
async function saveUser(userData) 
{
    try {
        const pool = await sql.connect(config);
        
        const query = `
            INSERT INTO users 
            (id, name, email, password, birthday, gender, age, height, weight, isRegistered) 
            VALUES (@id, @name, @email, @password, @birthday, @gender, @age, @height, @weight, @isRegistered)`;

        const request = pool.request();
        request.input('id', sql.Int, userData.id);
        request.input('name', sql.VarChar, userData.name);
        request.input('email', sql.VarChar, userData.email);
        request.input('password', sql.VarChar, userData.password);
        request.input('birthday', sql.Date, userData.birthday);
        request.input('gender', sql.VarChar, userData.gender);
        request.input('age', sql.Int, age(userData.birthday));
        request.input('height', sql.Decimal(5, 2), userData.height);
        request.input('weight', sql.Decimal(5, 2), userData.weight);
        request.input('isRegistered', sql.Bit, false);

        const result = await request.query(query);
        //console.log('Inserted user:', result.rowsAffected);
    } catch (err) {
        console.error('Database connection failed:', err);
    } finally {
        sql.close();
    }
}

// Function to authenticate a user against the database
const authenticateUser = async (username, password) => {
    try {
        const pool = await sql.connect(config);

        // Query to check if the user exists
        let userCheck = await pool.request()
            .input('username', sql.NVarChar, username)
            .query('SELECT * FROM USERS WHERE id = @username');

        if (userCheck.recordset.length === 0) {
            return { success: false, message: 'User not found' };
        }

        const user = userCheck.recordset[0];
        if (user.password !== password) {
            return { success: false, message: 'Incorrect password' };
        }

        return { success: true, userData: user };
    } 
    catch (error)
     {
        console.error('Error authenticating user:', error);
        return { success: false, message: 'Server error' };
    }
};

// Function to update a user's subscription status
async function subscribeToMessages(userData) 
{
    try {
        const pool = await sql.connect(config);

        const query = `
            UPDATE users 
            SET isRegistered = @isRegistered 
            WHERE id = @id`;

        const request = pool.request();
        request.input('id', sql.Int, userData.id);
        request.input('isRegistered', sql.Bit, userData.registeration);

        await request.query(query);
    } 
    catch (err) {
        console.error('Database update failed:', err);
    } 
    finally {
        sql.close();
    }
}

// Function to update user details in the database
async function updateUser(userData) 
{
    try {
        const pool = await sql.connect(config);

        const query = `
            UPDATE users 
            SET name = @name, email = @email, password = @password, birthday = @birthday, 
                gender = @gender, age = @age, height = @height, weight = @weight 
            WHERE id = @id`;

        const request = pool.request();
        request.input('id', sql.Int, userData.id);
        request.input('name', sql.VarChar, userData.name);
        request.input('email', sql.VarChar, userData.email);
        request.input('password', sql.VarChar, userData.password);
        request.input('birthday', sql.Date, userData.birthday);
        request.input('gender', sql.VarChar, userData.gender);
        request.input('age', sql.Int, age(userData.birthday));
        request.input('height', sql.Decimal(5, 2), userData.height);
        request.input('weight', sql.Decimal(5, 2), userData.weight);

        const result = await request.query(query);
        //console.log('Updated user:', result.rowsAffected);
    } 
    catch (err) {
        console.error('Database update failed:', err);
    } 
    finally {
        sql.close();
    }
}

// Function to fetch user data by a specific ID
async function fetchUserDataById(id) 
{
    try {
        await sql.connect(config);

        const result = await sql.query`
           SELECT gender, age, weight 
           FROM users 
           WHERE id=${id}`;

        return result.recordset;
    } 
    catch (err) {
        console.error('Database query error:', err);
        throw err;
    } 
    finally {
        await sql.close();
    }
}

// Function to check if a user exists in the database
const checkIfUserExists = async (id) => {
    try {
        const user = await sql.query(`SELECT * FROM Users WHERE id = ${id}`);
        return user.recordset.length > 0;
    } 
    catch (err) {
        console.error('Error checking user existence:', err.message);
        throw err;
    }
};

module.exports = { 
    saveUser, 
    updateUser, 
    authenticateUser, 
    fetchUserDataById, 
    subscribeToMessages, 
    checkIfUserExists 
};
