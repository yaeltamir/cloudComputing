// בroutes.js
const express = require('express');
const router = express.Router();
const mealsController = require('../controllers/mealsController'); // ייבוא הבקר
const usersController = require('../controllers/userController'); // ייבוא הבקר

// נתיב לגרף
router.get('/',async (req, res) => {
  //const id=req.session.user.id
  //const isRegistered=await usersController.checkIfUserIsRegistered(id)
    res.render('messages',{isRegistered:req.session.user.isRegistered,messages: [1,2,3]});
  });

router.get('/subscribe/:answer',usersController.reverseSubscribtion)
module.exports = router;


// const { Kafka } = require("kafkajs");

// const redpanda = new Kafka({
//   brokers: ["csovvkq0p8t14kkkbsag.any.eu-central-1.mpx.prd.cloud.redpanda.com:9092"],
//   ssl: {},
//   sasl: {
//     mechanism: "scram-sha-256",
//     username: "moshe",
//     password: "HyCUNWFmeV0jyA5PUygv9cXt6CbLbG"
//   }
// });