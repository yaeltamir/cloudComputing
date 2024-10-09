const sql = require('mssql');
const userModel = require('../models/userModel'); // חיבור ל-Model שמטפל בבסיס הנתונים

// פונקציה שמטפלת בהרשמה ושולחת את הנתונים ל-Model
const registerUser = (req, res) => {
    // קבלת הנתונים מהטופס שנשלחו דרך ה-POST
    const { id, name, email, password, dob, gender, age, height, weight } = req.body;

    console.log('ID:', id); // הדפס את ה-ID כדי לבדוק אם הוא מגיע כראוי

    // יצירת אובייקט שמכיל את הנתונים שנקבל מהטופס
    const userData = {
        id: parseInt(id),
        name: name,
        email: email,
        password: password,
        birthday: dob,
        gender: gender,
        age: parseInt(age),
        height: parseFloat(height),
        weight: parseFloat(weight)
    };

    console.log('User Data:', userData);

    // שמירת הנתונים ב-Database באמצעות ה-Model
    userModel.saveUser(userData)
        .then(() => {
            res.send('User registered successfully!');
        })
        .catch((err) => {
            console.error('Error saving user:', err.message);
            res.status(500).send('Error registering user.'); // שגיאה כללית
        });
};

module.exports = { registerUser };
