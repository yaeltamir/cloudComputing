const express = require('express');
const session = require('express-session');  //נסיוני
const app = express();
const port = 3000;


const userRoutes = require('./routes/user'); // הנתיב של ה-router שלך
const mealsRoutes = require('./routes/meals');
const historyRoutes = require('./routes/history');
const messagesRoutes = require('./routes/messages');

const homeRoutes = require('./routes/homeRoute');



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

app.use('/home', homeRoutes);


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

 app.get('/home', (req, res) => {
  // res.render('home',{userId:req.session.user.id,isRegistered:req.session.user.isRegistered});

   const user = req.session.user;

   // אם המשתמש קיים ב-session, שלח את שם המשתמש, אחרת שלח 'Guest'
   const userName = user ? user.name : 'Guest';
 
   // עכשיו תעביר את המשתנה userName יחד עם המשתנים האחרים
   res.render('home', { 
     userName: userName, 
     userId: user ? user.id : null, 
     isRegistered: user ? user.isRegistered : false 
   });
 });

 

app.get('/updateDetails', (req, res) => {
  const user = req.session.user; // מקבל את האובייקט של המשתמש מה-Session
 // const sMessage=req.session.message
  res.render('updateDetails', { userDetails: user});
});


const http = require('http');
const WebSocket = require('ws');
const { Kafka } = require('kafkajs');


const server = http.createServer(app);
const wss = new WebSocket.Server({ server });


// Global dictionary for storing messages by user ID and message status
const messagesDictionary = require('./controllers/messagesController');

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
  await consumer.subscribe({ topic: 'testsResults', fromBeginning: false });

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
        console.log(value)
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

