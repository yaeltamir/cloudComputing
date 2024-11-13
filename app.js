const express = require('express');
const session = require('express-session');  //נסיוני
const app = express();
const port = 3000;


const userRoutes = require('./routes/user'); // הנתיב של ה-router שלך
const mealsRoutes = require('./routes/meals');
const historyRoutes = require('./routes/history');
const messagesRoutes = require('./routes/messages');
const homeRoutes = require('./routes/home');

//חייב את זה כדי שהקטע עם הסשן יעבוד
app.use(session({
  secret: 'your-secret-key', // השתמש במפתח סודי ליצירת סשן
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false } // אם אתה עובד על HTTPS, שים את secure ל-true
})); //עד פה


// Middleware כדי לנתח בקשות POST מ-URL-encoded טפסים
app.use(express.urlencoded({ extended: true }));
app.use(express.json()); // לפרש בקשות JSON מהטפסים

app.use('/', userRoutes); // השתמש ב-router שיצרת
app.use('/meals', mealsRoutes);
app.use('/historyGraph', historyRoutes);
app.use('/messages',messagesRoutes);
app.use('/home',homeRoutes);


// הגדרת מנוע התבניות EJS
app.set('view engine', 'ejs');

// Middleware to serve static files from the "public" folder
app.use(express.static('public'));

// ניתוב לדף הבית - index.ejs

const render_index= (req, res) => {res.render('index')};

app.get('/index',render_index);

// ניתוב לדף הבית - index.ejs
app.get('/', render_index)

// ניתוב לדף ה-signUp - signUp.ejs
app.get('/signUp', (req, res) => {
  res.render('signUp');
});

// // ניתוב לדף ה-projects - projects.ejs
// app.get('/messages', );

// ניתוב לדף ה-meals - meals.ejs
app.get('/meals', (req, res) => {
  res.render('meals',{ successMessage: null,sugarPrediction:null,message:null})

  });
  

// // Route for the meals page
// app.get('/meals/:success', (req, res) => {
//   const successMessage = req.params.success === 'true' ?  'the meal was added successfully!' : null;
//   res.render('meals', { successMessage: successMessage });
// });


//  app.get('/home', (req, res) => {
//    res.render('home');
//  });

// app.get('/historyGraph', (req, res) => {
//   res.render('historyGraph');
// });

app.get('/updateDetails', (req, res) => {
  const user = req.session.user; // מקבל את האובייקט של המשתמש מה-Session
  //console.log('Session after login:', req.session);

  
  res.render('updateDetails', { userDetails: user });
});


// הפעלת השרת
app.listen(port, () => {
  console.log(`App is running on http://localhost:${port}`);
});


/*const sql = require('mssql');

const config = {
    user: 'yael_SQLLogin_1', // שם המשתמש שלך
    password: '65s55lgogc',    // הסיסמה שלך
    server: 'usersInformation.mssql.somee.com', // השרת
    database: 'usersInformation', // שם מאגר הנתונים
    options: {
        encrypt: true, // אם דרוש SSL
        trustServerCertificate: true // לאישור תעודת SSL
    }
};

async function connectToDatabase() {
    try {
        const pool = await sql.connect(config);
        console.log('Connected to the database!');

        // שאילתא עם פרמטרים
        const query = 'INSERT INTO users (id, name, email, password, birthday, gender, age, height, weight) VALUES (@id, @name, @email, @password, @birthday, @gender, @age, @height, @weight)';
        
        const request = pool.request();
        request.input('id', sql.Int, 214654121);
        request.input('name', sql.VarChar, 'yael');
        request.input('email', sql.VarChar, 'yaeltamir46@gmail.com');
        request.input('password', sql.VarChar, '1111');
        request.input('birthday', sql.Date, '2004-10-21'); // בפורמט YYYY-MM-DD
        request.input('gender', sql.VarChar, 'female');
        request.input('age', sql.Int, 19);
        request.input('height', sql.Decimal(5, 2), 1.64);
        request.input('weight', sql.Decimal(5, 2), 56.0);

        const result = await request.query(query);
        console.log('Inserted user:', result.rowsAffected);

    } 
    catch (err) 
    {
        console.error('Database connection failed:', err);
    } 
    finally
    {
        sql.close(); // סגירת החיבור
    }
}

connectToDatabase();
*/




// שימוש בנתיבים
//app.use('/index', userRoutes); // ודא שהשורה הזו קיימת





