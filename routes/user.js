const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');

// Route to handle user registration form submission
router.post('/register', userController.registerUser);

// Route for user login (ensure the loginUser function exists)
router.post('/login', userController.loginUser);

// Route to handle updating user details
router.post('/update', userController.updateUser);

// Route to render the sign-up page
router.get('/signUp', (req, res) => { 
  res.render('signUp'); 
});

// Route to render the update details page
router.get('/updateDetails', (req, res) => {
  const user = req.session.user; // Retrieve user data from the session

  // Pass user details to the 'updateDetails' view
  res.render('updateDetails', { userDetails: user });
});

module.exports = router;





