const sql = require('mssql');
//const { Sequelize } = require('sequelize');

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

function age(birthDate) {
    const today = new Date();
    const birth = new Date(birthDate);

    let age = today.getFullYear() - birth.getFullYear();

    // בדיקה אם יום ההולדת השנה כבר חלף
    const monthDifference = today.getMonth() - birth.getMonth();
    const dayDifference = today.getDate() - birth.getDate();

    if (monthDifference < 0 || (monthDifference === 0 && dayDifference < 0)) {
        age--;
    }

    return age;
}

//const sequelize = new Sequelize(config.database, config.user, config.password, config.options);
// פונקציה לשמירת משתמש חדש בבסיס הנתונים
async function saveUser(userData) {
    try {
        const pool = await sql.connect(config);
        console.log('Connected to the database!');

        const query = 'INSERT INTO users (id, name, email, password, birthday, gender, age, height, weight, isRegistered) VALUES (@id, @name, @email, @password, @birthday, @gender, @age, @height, @weight, @isRegistered)';
        
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
        console.log('Inserted user:', result.rowsAffected);
    } catch (err) {
        console.error('Database connection failed:', err);
    } finally {
        sql.close();
    }
}


// פונקציה שמבצעת אימות של משתמש מול מסד הנתונים
const authenticateUser = async (username, password) => {
    try {
        // חיבור למסד הנתונים
        let pool = await sql.connect(config);
        
        // שאילתת SQL לבדוק אם שם המשתמש קיים
        let userCheck = await pool.request()
            .input('username', sql.NVarChar, username)
            .query('SELECT * FROM USERS WHERE id = @username');

        // אם לא נמצא משתמש עם שם המשתמש
        if (userCheck.recordset.length === 0) {
            return { success: false, message: 'User not found' }; // שגיאה - לא נמצא משתמש
        }

        // אם נמצא, נבדוק אם הסיסמה נכונה
        const user = userCheck.recordset[0]; // קבלת הרשומה של המשתמש
        if (user.password !== password) {
            return { success: false, message: 'Incorrect password' }; // שגיאה - סיסמה שגויה
        }

        // אם הכל תקין, מחזירים הצלחה
        return { success: true, userData: user }; // הצלחה
    } catch (error) {
        console.error('Error authenticating user:', error);
        return { success: false, message: 'Server error' }; // שגיאה כללית
    }
};

async function subscribeToMessages(userData) {
    try{
        const pool = await sql.connect(config);
        const query = 'UPDATE users SET isRegistered = @isRegistered WHERE id = @id';
        const request = pool.request();
        request.input('id', sql.Int, userData.id);
        request.input('isRegistered', sql.Bit, userData.registeration);
        const result = await request.query(query);
    } catch (err) {
        console.error('Database Updated failed:', err);
    } finally {
        sql.close();
    }
    
}

//Update user details
async function updateUser(userData) {

    try {
        const pool = await sql.connect(config);
        console.log('Connected to the database!');

        const query = 'UPDATE users SET name = @name, email = @email, password = @password, birthday = @birthday, gender = @gender, age = @age, height = @height, weight = @weight WHERE id = @id';

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
        console.log('Updated user:', result.rowsAffected);
    } catch (err) {
        console.error('Database Updated failed:', err);
    } finally {
        sql.close();
    }
}

// שליפת נתונים מהטבלה users עבור idUser מסוים - כל השורות המתאימות
async function fetchUserDataById(id) {
    try {
        console.log(id)
        // התחברות למסד הנתונים
        await sql.connect(config);

        // שאילתת SELECT לשליפת הנתונים
        const result = await sql.query`
           SELECT gender, age, weight FROM users WHERE id=${id}`;
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




// // פונקציה שמביאה פרטי משתמש לפי שם משתמש וסיסמא
// async function getUserByUsernameAndPassword(id, password) {
//     try {
//         const pool = await sql.connect(config); // יצירת חיבור למסד הנתונים
//         console.log('Connected to the database!');

//         // שליפת פרטי המשתמש לפי שם משתמש וסיסמא
//         const query = 'SELECT * FROM users WHERE id = @id AND password = @password';
//         const request = pool.request();
//         request.input('id', sql.NVarChar, id);
//         request.input('password', sql.NVarChar, password);

//         const result = await request.query(query);
        
//         // בדיקה אם נמצא משתמש
//         if (result.recordset.length > 0) {
//             console.log(result.recordset[0]);
//             return result.recordset[0]; // החזרת פרטי המשתמש
//         } else {
//             return null; // אם לא נמצא משתמש
//         }
//     } catch (err) {
//         console.error('Error fetching user:', err);
//         throw err; // משליך את השגיאה כדי שה-Controller יוכל לטפל בה
//     } finally {
//         sql.close(); // סגירת חיבור למסד הנתונים
//     }
// }

//module.exports = { saveUser, updateUser, authenticateUser, getUserByUsernameAndPassword };


module.exports = { saveUser, updateUser, authenticateUser,fetchUserDataById,subscribeToMessages };

