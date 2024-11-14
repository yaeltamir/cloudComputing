const express = require('express');
const session = require('express-session');  //נסיוני
const app = express();
const port = 3000;


const userRoutes = require('./routes/user'); // הנתיב של ה-router שלך
const mealsRoutes = require('./routes/meals');
const historyRoutes = require('./routes/history');
const messagesRoutes = require('./routes/messages');


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
  res.render('meals',{ successMessage: null,sugarPrediction:null,message:null,userId:req.session.user.id,isRegistered:req.session.user.isRegistered})

  });
  

// // Route for the meals page
// app.get('/meals/:success', (req, res) => {
//   const successMessage = req.params.success === 'true' ?  'the meal was added successfully!' : null;
//   res.render('meals', { successMessage: successMessage });
// });


 app.get('/home', (req, res) => {
   res.render('home',{userId:req.session.user.id,isRegistered:req.session.user.isRegistered});
 });

// app.get('/historyGraph', (req, res) => {
//   res.render('historyGraph');
// });

app.get('/updateDetails', (req, res) => {
  const user = req.session.user; // מקבל את האובייקט של המשתמש מה-Session
  //console.log('Session after login:', req.session);

  
  res.render('updateDetails', { userDetails: user });
});


// // הפעלת השרת
// app.listen(port, () => {
//   console.log(`App is running on http://localhost:${port}`);
// });


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


//new------------------------------------------------------------------------------------------------------------------------------

// // שימוש בנתיבים
// //app.use('/index', userRoutes); // ודא שהשורה הזו קיימת

// //const express = require('express');
// const WebSocket = require('ws');
// //const app = express();
// const PORT = 3000;
// const { handleWebSocketConnection } = require('./controllers/messagesController');




// // // WebSocket server setup
// // const server = app.listen(PORT, () => {
// //   console.log(`Server running on http://localhost:${PORT}`);
// // });

// // const wss = new WebSocket.Server({ server });
// // wss.on('connection', handleWebSocketConnection);

// // module.exports = app;

// const http = require("http");
// const WebSocket = require("ws");

// const { startKafkaConsumer } = require("./consumer");.........


// const server = http.createServer(app);
// const wss = new WebSocket.Server({ server });

// global.wsConnections = {}; // Store WebSocket connections by user ID



// // // Routes
// // app.get("/", (req, res) => {
// //   res.render("index"); // Entry point for WebSocket connection
// // });

// // app.get("/messages", (req, res) => {
// //   const { userId } = req.query;
// //   res.render("messages", { userId });
// // });

// // WebSocket handling
// wss.on("connection", (ws, req) => {

//  // const userId = req.session.

//   if (userId) {
//     wsConnections[userId] = ws;
//     console.log(`WebSocket connection established for user ID: ${userId}`);

//     ws.on("close", () => {
//       delete wsConnections[userId];
//       console.log(`WebSocket connection closed for user ID: ${userId}`);
//     });
//   }
// });

// // Start Kafka consumer and server
// startKafkaConsumer();
// server.listen(3000, () => {
//   console.log("Server is running on http://localhost:3000");
// });



//-------------------------------

// //setting websocket server
// const http = require("http");


// const setupWebSocket = require("./wsServer");
// const runConsumer = require("./consumer");
// // const indexRoutes = require("./routes/index");
// // const messageRoutes = require("./routes/messages");


// const server = http.createServer(app);

// // WebSocket setup
// setupWebSocket(server);

// // Kafka consumer setup
// runConsumer().catch((err) => console.error("Kafka Consumer Error:", err));

// server.listen(port, () => {
//   console.log(`Server running on http://localhost:${port}`);
// });

//-----------------------------------------------------------------------------------------
// const http = require('http');
// const WebSocket = require('ws');
// const { Kafka } = require('kafkajs');


// const server = http.createServer(app);
// const wss = new WebSocket.Server({ server });

// // Initialize global dictionary for storing messages by user ID
// const messagesDictionary = {};

// // WebSocket connections by user ID
// const wsConnections = {};

// // Set up WebSocket server to listen for incoming connections
// wss.on('connection', (ws, req) => {
//   ws.on('message', (userId) => {
//     // Associate WebSocket connection with the user ID
//     wsConnections[userId] = ws;

//     // Send any existing messages for this user
//     if (messagesDictionary[userId]) {
//       ws.send(JSON.stringify(messagesDictionary[userId]));
//     }
//   });
// });

// // Initialize Kafka consumer
// const kafka = new Kafka({
//   brokers: ["csovvkq0p8t14kkkbsag.any.eu-central-1.mpx.prd.cloud.redpanda.com:9092"],
//   ssl: {},
//   sasl: { mechanism: "scram-sha-256", username: "moshe", password: "HyCUNWFmeV0jyA5PUygv9cXt6CbLbG" }
// });

// const consumer = kafka.consumer({ groupId: 'global-consumer-group' });

// const run = async () => {
//   await consumer.connect();
//   await consumer.subscribe({ topic: 'testsResults', fromBeginning: true });

//   // Process each message from Kafka
//   await consumer.run({
//     eachMessage: async ({ message }) => {
//       const userId = message.key?.toString();
//       const value = message.value?.toString();

//       if (userId && value) {
//         // Add message to global dictionary
//         if (!messagesDictionary[userId]) {
//           messagesDictionary[userId] = [];
//         }
//         messagesDictionary[userId].push(value);

//         // Broadcast new message to the WebSocket client if connected
//         const ws = wsConnections[userId];
//         if (ws) {
//           ws.send(JSON.stringify([value])); // Send new message as an array
//         }
//       }
//     },
//   });
// };

// run().catch(console.error);

// server.listen(3000, () => {
//   console.log('Server is running on http://localhost:3000');
// });
//----------------------------------------------------------------------------------------

// app.js



const http = require('http');
const WebSocket = require('ws');
const { Kafka } = require('kafkajs');


const server = http.createServer(app);
const wss = new WebSocket.Server({ server });
const PORT = 3000;

// Global dictionary for storing messages by user ID and message status
const messagesDictionary = {};

// WebSocket connections by user ID
const wsConnections = {};

// WebSocket server setup
wss.on('connection', (ws, req) => {
  ws.on('message', (userId) => {
    // Associate WebSocket connection with the user ID
    wsConnections[userId] = ws;

    // Initialize dictionary entry for this user if not present
    if (!messagesDictionary[userId]) {
      messagesDictionary[userId] = { messages: [], hasNewMessage: false };
    }

    // Send existing messages and "new message" status for this user
    ws.send(JSON.stringify({ 
      messages: messagesDictionary[userId].messages,
      hasNewMessage: messagesDictionary[userId].hasNewMessage
    }));
  });
});


app.post('/resetNotification/:userId', (req, res) => {
  const { userId } = req.params;
  if (messagesDictionary[userId]) {
    messagesDictionary[userId].hasNewMessage = false;
  }
  res.sendStatus(200);
});


// Kafka consumer setup
const kafka = new Kafka({
  brokers: ["csovvkq0p8t14kkkbsag.any.eu-central-1.mpx.prd.cloud.redpanda.com:9092"],
  ssl: {},
  sasl: { mechanism: "scram-sha-256", username: "moshe", password: "HyCUNWFmeV0jyA5PUygv9cXt6CbLbG" }
});

const consumer = kafka.consumer({ groupId: 'global-consumer-group' });

const run = async () => {
  await consumer.connect();
  await consumer.subscribe({ topic: 'testsResults', fromBeginning: true });

  // Process each message from Kafka
  await consumer.run({
    eachMessage: async ({ message }) => {
      const userId = message.key?.toString();
      const value = message.value?.toString();

      if (userId && value) {
        // Add message and set hasNewMessage to true
        if (!messagesDictionary[userId]) {
          messagesDictionary[userId] = { messages: [], hasNewMessage: false };
        }
        messagesDictionary[userId].messages.push(value);
        messagesDictionary[userId].hasNewMessage = true;

        // Notify connected WebSocket client
        const ws = wsConnections[userId];
        if (ws) {
          ws.send(JSON.stringify({ 
            messages: [value], 
            hasNewMessage: true 
          }));
        }
      }
    },
  });
};

run().catch(console.error);

server.listen(3000, () => {
  console.log('Server is running on http://localhost:3000');
});


// // Global dictionary for storing messages by user ID
// const messagesDictionary = {};

// // WebSocket connections by user ID
// const wsConnections = {};

// // Setup WebSocket server to listen for incoming connections
// wss.on('connection', (ws) => {
//   ws.on('message', (userId) => {
//     wsConnections[userId] = ws;

//     if (messagesDictionary[userId]) {
//       ws.send(JSON.stringify(messagesDictionary[userId]));
//     }
//   });
// });

// // Initialize Kafka consumer
// const kafka = new Kafka({
//     brokers: ["csovvkq0p8t14kkkbsag.any.eu-central-1.mpx.prd.cloud.redpanda.com:9092"],
//     ssl: {},
//     sasl: { mechanism: "scram-sha-256", username: "moshe", password: "HyCUNWFmeV0jyA5PUygv9cXt6CbLbG" }
//   });

// const consumer = kafka.consumer({ groupId: 'user-group' });

// const run = async () => {
//   await consumer.connect();
//   await consumer.subscribe({ topic: 'testsResults', fromBeginning: false });

//   await consumer.run({
//     eachMessage: async ({ message }) => {
//       const userId = message.key?.toString();
//       const content = message.value?.toString();

//       if (userId && content) {
//         if (!messagesDictionary[userId]) {
//           messagesDictionary[userId] = [];
//         }
//         messagesDictionary[userId].push(content);

//         const ws = wsConnections[userId];
//         if (ws) {
//           ws.send(JSON.stringify([content]));
//         }
//       }
//     },
//   });
// };

// run().catch(console.error);

// // Start server
// server.listen(PORT, () => {
//   console.log(`Server running on http://localhost:${PORT}`);
// });





//------------------------------------------------------------------------------------------------------------------------------
