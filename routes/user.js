const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');

// כאשר המשתמש שולח את הטופס נבצע קריאה לפונקציה registerUser
router.post('/register', userController.registerUser);

// נתיב POST לכניסה
router.post('/login', userController.loginUser); // ודא שהפונקציה לא undefined

// נתיב לעדכון משתמש
router.post('/update', userController.updateUser); // כאן הוספנו את הנתיב שיטפל בעדכון





module.exports = router;





