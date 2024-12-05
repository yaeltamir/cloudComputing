const { DecisionTreeClassifier } = require('ml-cart');
const mealsModel = require('../models/mealsModel'); // Importing the meals model
const userModel = require('../models/userModel');   // Importing the user model

let holiday="Regular Day"
let components={}
let mealSugar=0

// Function to add a meal
// Receives data from meals.ejs, sends it to the model, and returns a success/failure message
async function addMeal(req, res) {
    const idUser = req.session.user.id; // Get the user ID from the session
    const { kindOfMeal, date, time, imageUrl, sugarLevel } = req.body;

    //if(!holiday||!components||!mealSugar){ return res.status(400).send('something went wrong');}

    const meal = {
        idUser,
        kindOfMeal,
        date,
        time,
        holiday,
        components,
        mealSugar,
        imageUrl,
        sugarLevel
    };

    const result = await mealsModel.addMeal(meal);

    if (result.success) {
         req.session.message= "The meal was added successfully!",
        res.redirect('/meals' );
    } else {
        res.status(500).send(`Error: ${result.error}`);
    }
}

// Convert kind of meal from string to numeric representation
function kindOfMealToNumbers(kindOfMeal) {
    if (kindOfMeal === "breakfast") return 0;
    if (kindOfMeal === "lunch") return 1;
    if (kindOfMeal === "dinner") return 2;
    return 3; // Default case for snacks or others
}

// Convert holiday type to numeric representation
function isHolidayToNumbers(kindOfMeal) {
    if (kindOfMeal === "YomTov") return 0;
    if (kindOfMeal === "Shabbat") return 1;
    if (kindOfMeal === "Chol HaMoed") return 2;
    return 3; // Default case
}

async function calculateIsHoliday(req, res) {
    const { date } = req.body;
    try {
        holiday=await mealsModel.checkHebcalDate(new Date(date));
    } catch (error) {
        console.error('Error calculating isHoliday:', error);
        res.status(500).json({ error: 'Error calculating isHoliday' });
    }
}

async function calculateComponentsAndMealSugar(req, res) {
    const { url } = req.body;
    try {
       components=await mealsModel.tagImage(url)
       mealSugar=await mealsModel.calculateTotalSugar(components)
       return mealSugar
    } 
    catch (error) {
        console.error('Error calculating components and meal sugar:', error);
        res.status(500).json({ error: 'Error calculating components and meal sugar' });
    }
}


// Function to predict sugar level using a decision tree model
async function predictSugarLevel(req, res) {
    const idUser = req.session.user.id;
    const { kindOfMeal} = req.body;

    try {
        // Fetch meal and user data for the current user
        const mealsData = await mealsModel.fetchMealDataById(idUser);
        const usersData = await userModel.fetchUserDataById(idUser);

        // Ensure sufficient data for prediction
        if (mealsData.length < 20 || usersData.length === 0) {
            res.json({
                prediction: "ERROR",
                message: "Insufficient data for prediction. Please add more data before using this feature.",
            });
            return;
        }

        const user = usersData[0]; // Extract user details

        // Combine meal and user data
        const data = mealsData.map(meal => ({
            isHoliday: meal.isHoliday,
            kindOfMeal: meal.kindOfMeal,
            gender: user.gender,
            age: user.age,
            weight: user.weight,
            mealSugar: meal.mealSugar,
            sugarLevel: meal.sugarLevel,
        }));

        // Prepare features and labels for training
        const features = data.map(row => [
            isHolidayToNumbers(row.isHoliday),
            kindOfMealToNumbers(row.kindOfMeal),
            row.gender === "male" ? 1 : 2,
            row.age,
            row.weight,
            row.mealSugar,
        ]);
        const labels = data.map(row => row.sugarLevel);

        // Train decision tree model
        const decisionTree = new DecisionTreeClassifier();
        decisionTree.train(features, labels);

        // Prepare new data for prediction

        const isHoliday=holiday
        const totalSugar=mealSugar

        const newData = [[
            isHolidayToNumbers(isHoliday),
            kindOfMealToNumbers(kindOfMeal),
            user.gender === "male" ? 1 : 2,
            user.age,
            user.weight,
            totalSugar,
        ]];

        const prediction = decisionTree.predict(newData);

        // Generate recommendation message based on prediction
        let predictionMessage = "";
        if (prediction[0] >= 100) {
            predictionMessage = "It is not recommended to eat this meal due to your sugar level. If you decide to eat it, measure your sugar level afterward.";
        } else {
            predictionMessage = "This meal is recommended based on your sugar level. Remember to measure your sugar level after eating.";
        }

        res.json({
            prediction: prediction[0],
            message: predictionMessage,
        });
    } catch (error) {
        console.error("Error predicting sugar level:", error.message);
    }
}

// Function to display sugar level history graph
async function showHistoryGraph(req, res) {
    const userId = req.session.user.id;
    const { startDate, endDate, mealType } = req.query;

    const meals = await mealsModel.fetchMealDataById(userId);

    const filteredMeals = meals.filter(meal => {
        const mealDate = new Date(meal.Date);
        const start = startDate ? new Date(startDate) : null;
        const end = endDate ? new Date(endDate) : null;

        // Date range filtering
        const isDateInRange = 
            (!start || mealDate >= start) && 
            (!end || mealDate <= end);

        // Meal type filtering
        const isMealTypeMatch = 
            !mealType || 
            (mealType && meal.kindOfMeal.toLowerCase() === mealType.toLowerCase());

        return isDateInRange && isMealTypeMatch;
    });

    // Rest of the function remains the same...
    filteredMeals.sort((a, b) => new Date(a.Date) - new Date(b.Date));

    const dates = filteredMeals.map(meal => {
        const date = new Date(meal.Date);
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const year = date.getFullYear();
        const time = meal.Time;
        const hours = String(time.getHours()).padStart(2, '0');
        const minutes = String(time.getMinutes()).padStart(2, '0');
        return `${day}/${month}/${year} ${hours}:${minutes}`;
    });

    const sugarLevels = filteredMeals.map(meal => meal.sugarLevel);
    const mealImages = filteredMeals.map(meal => meal.imageUrl);

    res.render('historyGraph', { 
        dates, 
        sugarLevels, 
        mealImages, 
        userId, 
        isRegistered: req.session.user.isRegistered 
    });
}

// Function to fetch the last three meals
async function getLastMeals(req, res, next) {
    if (!req.session.user || !req.session.user.id) {
        console.error('User is not logged in or user ID is missing');
        return res.status(400).send('User is not logged in or user ID is missing');
    }

    const userId = req.session.user.id;

    try {
        const meals = await mealsModel.fetchMealDataById(userId);

        const lastThreeMeals = meals
            .sort((a, b) => new Date(b.Date) - new Date(a.Date))
            .slice(0, 3);

        req.lastThreeMeals = lastThreeMeals;
        next(); // Pass control to the next middleware/handler
    } catch (error) {
        console.error('Error fetching last meals:', error);
        res.status(500).send('Error fetching last meals');
    }
}

module.exports = { addMeal,predictSugarLevel, showHistoryGraph, getLastMeals,calculateIsHoliday,calculateComponentsAndMealSugar }; 







