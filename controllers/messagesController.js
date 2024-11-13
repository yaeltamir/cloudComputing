






















// // // // const { runConsumer } = require("../consumer");

// // // // // משתנה גלובלי לאחסון הודעות זמניות
// // // // let messages = [];

// // // // // // פונקציה להרשמה
// // // // // const subscribeUser = (req, res) => {
// // // // //   req.session.user.isRegistered = true;
// // // // //   res.redirect("/messages");
// // // // // };

// // // // // // פונקציה לביטול הרשמה
// // // // // const unsubscribeUser = (req, res) => {
// // // // //   req.session.user.isRegistered = false;
// // // // //   res.redirect("/messages");
// // // // // };

// // // // // התחלת ה-consumer אם המשתמש רשום
// // // // const startConsumerIfRegistered = (id) => {
// // // //     runConsumer(id, (msg) => { 
// // // //     console.log(msg)
// // // //     messages.push(msg);});
// // // //     console.log(messages)
// // // // };

// // // // // פונקציה להצגת ההודעות ב-View
// // // // const renderMessages = (req, res) => {
// // // // //const isRegistered=req.session.user.isRegistered
// // // // const isRegistered=true
// // // //   if (isRegistered) {
// // // //    // startConsumerIfRegistered(req.session.user.id);
// // // //    startConsumerIfRegistered(123456789);
// // // //   }
// // // //   console.log(messages)
// // // //   res.render('messages', { 
// // // //     isRegistered: isRegistered, 
// // // //     messages: messages 
// // // //   });
// // // //   console.log(6)
// // // // };

// // // // module.exports = {  renderMessages };


// // const { runConsumer, userMessages } = require("../consumer");

// // // const renderMessages = (req, res) => {
// // //   const isRegistered = true; // Replace with actual user session check
// // //   const userId = 123456789; // Replace with actual user ID from session

// // //   if (isRegistered) {
// // //     // Start consumer if messages are not already fetched for the user
// // //     if (!userMessages[userId]) {
// // //       runConsumer(userId, (messages) => {
// // //         res.render("messages", {
// // //           isRegistered,
// // //           messages: messages.length ? messages : ["No new messages received yet."]
// // //         });
// // //       });
// // //     } else {
// // //       res.render("messages", {
// // //         isRegistered,
// // //         messages: userMessages[userId].length
// // //           ? userMessages[userId]
// // //           : ["No new messages received yet."]
// // //       });
// // //     }
// // //   } else {
// // //     res.render("messages", {
// // //       isRegistered: false,
// // //       messages: ["Please subscribe to receive messages."]
// // //     });
// // //   }
// // // };

// // // module.exports = { renderMessages };

// // // let messages = [];
// // // let isConsumerStarted = false;

// // // const startConsumerIfRegistered = (id, res) => {
// // //   if (!isConsumerStarted) {
// // //     runConsumer(
// // //       id,
// // //       (msg) => {
// // //         messages.push(msg);
// // //       },
// // //       () => { // On timeout
// // //         if (messages.length === 0) {
// // //           messages.push('No new messages');
// // //         }
// // //         res.render('messages', { isRegistered: true, messages: messages });
// // //       }
// // //     );
// // //     isConsumerStarted = true;
// // //   }
// // // };

// // // const renderMessages = (req, res) => {
// // //   const isRegistered = true;

// // //   if (isRegistered) {
// // //     startConsumerIfRegistered(123456789, res);
// // //   } else {
// // //     res.render('messages', { isRegistered: false, messages: [] });
// // //   }
// // // };

// // // module.exports = { renderMessages };


// //כאן הכי טוב כרגע
// const { runConsumer } = require("../consumer");

// // משתנה גלובלי לאחסון הודעות זמניות
// let messages = [];

// // התחלת ה-consumer אם המשתמש רשום
// const startConsumerIfRegistered =async (res,id) => {
//     runConsumer(id, (msg) => { 
//     console.log(msg)
//     messages.push(msg);
// }).then(res.render('messages', { 
//     isRegistered: true, 
//     messages: messages 
//   }));
//   console.log(123)
// };

// // פונקציה להצגת ההודעות ב-View
// const renderMessages =async (req, res) => {
// const isRegistered=req.session.user.isRegistered
// //const isRegistered=true
// console.log(isRegistered)
//   if (isRegistered) {
//    // startConsumerIfRegistered(req.session.user.id);
//    await startConsumerIfRegistered(res,req.session.user.id);
//   }
//   //console.log(messages)
//   else{
//   res.render('messages', { 
//     isRegistered:false, 
//     messages: [] 
//   });}
//    console.log(6)
// };

// module.exports = {  renderMessages };
// //עד כאן

