const express = require('express');
const session = require('express-session');  //נסיוני
const app = express();
const port = 3000;


const userRoutes = require('./routes/user');
const mealsRoutes = require('./routes/meals');
const historyRoutes = require('./routes/history');
const messagesRoutes = require('./routes/messages');
const homeRoutes = require('./routes/homeRoute');


// Enable session management for the application
app.use(session({
  secret: 'your-secret-key', // The secret key used to sign the session cookie. Keep this private and complex.
  resave: false, // Prevents resaving the session if no changes were made. Saves resources by avoiding unnecessary writes.
  saveUninitialized: true, // Ensures a session is created even if it hasn't been modified. Set to false to optimize resource usage.
  cookie: {
    secure: false // If using HTTPS, set this to true to ensure cookies are only sent over secure connections.
  }
}));

// Middleware to parse URL-encoded data from POST requests (used by HTML forms)
app.use(express.urlencoded({ extended: true })); // `extended: true` allows parsing of nested objects (using the `qs` library)
// Middleware to parse JSON data from POST requests (commonly used in APIs)
app.use(express.json());
// Middleware to serve static files from the "public" folder
app.use(express.static('public'));

app.use('/', userRoutes);
app.use('/meals', mealsRoutes);
app.use('/historyGraph', historyRoutes);
app.use('/messages', messagesRoutes);
app.use('/home', homeRoutes);


// Set EJS as the template engine for rendering dynamic HTML views
app.set('view engine', 'ejs');


// Route to render the home page using the 'index.ejs' template
const render_index = (req, res) => { res.render('index'); };
// Route to access the home page via '/index' URL
app.get('/index', render_index);
// Route to access the home page via the root URL '/'
app.get('/', render_index);


//-----------kafka------------
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

