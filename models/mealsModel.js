const sql = require('mssql');
const axios = require('axios');

// Model: Responsible for handling database communication and data processing.

// Connects to the Imagga API to retrieve tags for a given image URL.
async function tagImage(url) 
{
  try {
      // Authentication credentials for Imagga API
      const auth = {
          username: 'acc_9ebe20e5f006a3a',
          password: '6b2ea34c4db987ab07768f1cea5667b6'
      };
      
      // Sending a GET request to the Imagga API
      const response = await axios.get(`https://api.imagga.com/v2/tags`, {
          params: { image_url: url },
          auth: auth
      });

      // Filter results to include only tags with confidence >= 70%
      const tags = response.data.result.tags.filter(tag => tag.confidence >= 70);
      
      // Map the filtered tags to an array of objects with tag name and confidence
      return tags.map(tag => ({ tag: tag.tag.en, confidence: tag.confidence }));

  } 
  catch (error) {
      console.error('Error tagging image:', error.message);
      throw error;
  }
}

// Fetches the sugar content of a single ingredient using the USDA API.
async function getSugarContent(ingredient) 
{
  try {
    // Query the USDA API for ingredient details
    const response = await axios.get(`https://api.nal.usda.gov/fdc/v1/foods/search?query=${ingredient.tag}&api_key=ihExc60qvApvmTjPT1FlaZ2TTYBjTbqFGeh3GRLO`);
    const foodData = response.data.foods[0];

    // Check if foodNutrients exists and retrieve 'Total Sugars'
    const sugarContent = foodData.foodNutrients
      ? foodData.foodNutrients.find(nutrient => nutrient.nutrientName === 'Total Sugars')
      : null;

    let sugarValue = 0; // Default sugar value

    if (sugarContent && !isNaN(sugarContent.value)) {
      sugarValue = parseFloat(sugarContent.value);
    } else {
      return -1
    }
    // Ensure sugarValue is a valid number before sending to an API
    if (typeof sugarValue === 'number' && !isNaN(sugarValue)) {
      console.log(`Sugar value to send: ${sugarValue}`);
    } else {
      console.error("Invalid sugar value, cannot send.");
    }
    return sugarValue;
  } 
  catch (error) {
    console.error(`Error fetching sugar content for ${ingredient.tag}:`, error.message);
    return null;
  }
}

// Calculates the total sugar content for a list of components.
async function calculateTotalSugar(components)
 {
  let totalSugar = 0;
  for (const component of components)
  {
      const sugar = await getSugarContent(component);
      if(sugar===-1)
        return -1
      totalSugar += sugar;
  }

  return totalSugar;
}

// Identifies the type of day (e.g., holiday, Shabbat) using the Hebcal API.
async function checkHebcalDate(date) 
{
  const dateStr = date.toISOString().substring(0, 10);
  const url = `https://www.hebcal.com/hebcal?v=1&cfg=json&maj=on&min=on&mod=on&nx=on&ss=on&mf=on&c=on&s=on&start=${dateStr}&end=${dateStr};`;
  
  try {
    const response = await axios.get(url);
    const data = response.data;

    // Check for significant events on the date
    for (const item of data.items) 
    {
      if (item.yomtov === true) {
        return "YomTov";
      } 
      else if (item.title.includes("Shabbat")||item.title.includes("Parashat")) {
        return "Shabbat";
      } 
      else if (item.title.includes("CH’’M")) { // Check for Chol HaMoed
        return "Chol HaMoed";
      } 
      else if (item.category === "holiday") {
        return "Holiday";
      }
    }
    // If no special event, return "Regular Day"
    return "Regular Day";
  } 
  catch (error) {
    console.error("Error fetching data:", error);
    return "Error";
  }
}

// Configuration for connecting to the database.
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

// Adds a meal to the database after processing its components and sugar content.
async function addMeal(meal)
 {
  try {

    // Connect to the database
    let pool = await sql.connect(config);

    // Insert the meal record into the database
    await pool.request()
    .input('idUser', sql.Int, meal.idUser)
    .input('kindOfMeal', sql.NVarChar, meal.kindOfMeal)
    .input('Date', sql.Date, meal.date)
    .input('Time', sql.NVarChar, meal.time)
    .input('isHoliday', sql.NVarChar, meal.holiday)
    .input('Components', sql.NVarChar, JSON.stringify(meal.components))
    .input('imageUrl', sql.NVarChar, meal.imageUrl)
    .input('sugarLevel', sql.Int, meal.sugarLevel)
    .input('mealSugar', sql.Decimal(10, 2), meal.mealSugar)
    .query(`INSERT INTO meals (idUser, kindOfMeal, Date, Time, isHoliday, Components, imageUrl, sugarLevel, mealSugar) 
            VALUES (@idUser, @kindOfMeal, @Date, @Time, @isHoliday, @Components, @imageUrl, @sugarLevel, @mealSugar)`);

    return { success: true };
  } 
  catch (err) {
    return { success: false, error: err.message };
  }
}

// Fetches all meal records for a specific user ID from the database.
async function fetchMealDataById(id) 
{
  try {
    // Connect to the database
    await sql.connect(config);

    // Execute a SELECT query to fetch meal records for the user
    const result = await sql.query`
        SELECT *
        FROM meals
        WHERE idUser = ${id}`;

    // Return the query results
    return result.recordset;
  } 
  catch (err) {
    console.error('Database query error:', err);
    throw err;
  } 
  finally {
    // Close the database connection
    await sql.close();
  }
}

module.exports = { checkHebcalDate, addMeal, calculateTotalSugar, fetchMealDataById, tagImage };


