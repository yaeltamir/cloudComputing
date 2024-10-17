const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');

// כאשר המשתמש שולח את הטופס נבצע קריאה לפונקציה registerUser
router.post('/register', userController.registerUser);

// נתיב POST לכניסה
router.post('/login', userController.loginUser); // ודא שהפונקציה לא undefined

// נתיב לעדכון משתמש
router.post('/update', userController.updateUser); // כאן הוספנו את הנתיב שיטפל בעדכון

// נתיב לקבלת פרטי משתמש לפי שם משתמש וסיסמא
//router.post('/userDetails', userController.getUserDetails);


// router.post('/userDetails', (req, res) => {
//     console.log('Route /userDetails triggered');
//     res.send('Route works');
// });



module.exports = router;





