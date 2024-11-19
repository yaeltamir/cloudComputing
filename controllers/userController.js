const sql = require('mssql');
const userModel = require('../models/userModel'); // Import the user model for database interactions

/**
 * Handles user registration and sends data to the model.
 * If the user already exists, updates their data instead of creating a new record.
 */
const registerUser = async (req, res) => {
    const { id, name, email, password, dob, gender, height, weight } = req.body;

    // Prepare user data object
    const userData = {
        id: parseInt(id),
        name: name,
        email: email,
        password: password,
        birthday: dob,
        gender: gender,
        age: calculateAge(dob), // Calculate user's age from their date of birth
        height: parseFloat(height),
        weight: parseFloat(weight)
    };

    // Check if the user already exists in the database
    const check = await userModel.fetchUserDataById(id);

    if (check.length > 0) {
        // If the user exists, update their data
        userModel.updateUser(userData);
        res.send("The data was updated successfully!");
    } 
    else {
        // Save new user data to the database
        userModel.saveUser(userData)
            .then(() => {
                res.send('User registered successfully!');
            })
            .catch((err) => {
                console.error('Error saving user:', err.message);
                res.status(500).send('Error registering user.');
            });
    }
};

/**
 * Utility function to calculate age from a given birth date.
 */
function calculateAge(birthDate) {
    const today = new Date();
    const birth = new Date(birthDate);

    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    const dayDiff = today.getDate() - birth.getDate();

    // Adjust age if the birthday hasn't occurred yet this year
    if (monthDiff < 0 || (monthDiff === 0 && dayDiff < 0)) {
        age--;
    }

    return age;
}

const { authenticateUser } = require('../models/userModel'); // Import authentication function from the user model

/**
 * Handles user login requests.
 * If authentication succeeds, redirects to the user's homepage.
 * Otherwise, renders the login page with an error message.
 */
const loginUser = async (req, res) => {
    const { username, password } = req.body;

    // Authenticate the user using the model
    const result = await authenticateUser(username, password);

    const errorMessage = result.success ? null : result.message; // Provide error message if login fails

    if (result.success) {
        // Store user data in the session and redirect to the homepage
        req.session.user = result.userData;
        res.redirect('home');
    } 
    else {
        // Render the login page with an error message
        res.render('index', { errorMessage: errorMessage || '' });
    }
};

/**
 * Handles user data updates.
 */
const updateUser = (req, res) => {
    const { id, name, email, password, dob, gender, age, height, weight } = req.body;

    // Prepare updated user data object
    const updatedUserData = {
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

    // Update user data in the database
    userModel.updateUser(updatedUserData)
        .then(() => {
            res.send('User updated successfully!');
        })
        .catch((err) => {
            console.error('Error updating user:', err.message);
            res.status(500).send('Error updating user.');
        });
};

const messagesDictionary = require('../controllers/messagesController'); // Import messages dictionary for managing user messages

/**
 * Toggles the user's subscription to message notifications.
 */
const reverseSubscribtion = (req, res) => {
    const answer = req.params.answer; // Subscription status ("true" or "false")
    const idUser = req.session.user.id;

    // Clear messages if the user unsubscribes
    if (answer.toLowerCase() === "false") {
        messagesDictionary[idUser].messages = [];
    }

    // Prepare updated subscription data
    const updatedUserData = {
        id: parseInt(idUser),
        registeration: answer.toLowerCase() === "true"
    };

    // Update the user's subscription status in the database
    userModel.subscribeToMessages(updatedUserData)
        .then(() => {
            req.session.user.isRegistered = updatedUserData.registeration; // Update session data
            res.redirect('/messages');
        })
        .catch((err) => {
            console.error('Error updating user:', err.message);
            res.status(500).send('Error updating user.');
        });
};

// Export all functions to be used in the routing layer
module.exports = { registerUser, loginUser, updateUser, reverseSubscribtion };
