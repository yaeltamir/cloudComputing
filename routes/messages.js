//הכי טוב כרגע




//עד כאן











































// // בroutes.js
// const express = require('express');
// const router = express.Router();
// const mealsController = require('../controllers/mealsController'); // ייבוא הבקר
// const usersController = require('../controllers/userController'); // ייבוא הבקר
// //const messages = require('../consumer');
// const messagesController = require("../controllers/messagesController");


// // // נתיב לגרף
// // router.get('/',async (req, res) => {
// //   //const id=req.session.user.id
// //   const isRegistered=req.session.user.isRegistered


// //     res.render('messages',{isRegistered:isRegistered,messages: isRegistered?messages:[]});
// //   });

//   router.get("/", messagesController.renderMessages);

// router.get('/subscribe/:answer',usersController.reverseSubscribtion)
// module.exports = router;


// // const { Kafka } = require("kafkajs");

// // const redpanda = new Kafka({
// //   brokers: ["csovvkq0p8t14kkkbsag.any.eu-central-1.mpx.prd.cloud.redpanda.com:9092"],
// //   ssl: {},
// //   sasl: {
// //     mechanism: "scram-sha-256",
// //     username: "moshe",
// //     password: "HyCUNWFmeV0jyA5PUygv9cXt6CbLbG"
// //   }
// // });

const express = require("express");
const router = express.Router();
const messagesController = require("../controllers/messagesController");
const usersController = require("../controllers/userController");

router.get("/", messagesController.renderMessages);
router.get("/subscribe/:answer", usersController.reverseSubscribtion);

module.exports = router;
