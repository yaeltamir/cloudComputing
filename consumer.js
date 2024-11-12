// // // // consumer.js
// // // const { Kafka } = require("kafkajs");

// // // const redpanda = new Kafka({
// // //   brokers: ["csovvkq0p8t14kkkbsag.any.eu-central-1.mpx.prd.cloud.redpanda.com:9092"],
// // //   ssl: {},
// // //   sasl: {
// // //     mechanism: "scram-sha-256",
// // //     username: "moshe",
// // //     password: "HyCUNWFmeV0jyA5PUygv9cXt6CbLbG"
// // //   }
// // // });

// // // const consumer = redpanda.consumer({ groupId: 'consumer-group' });

// // // // משתנה לאחסון ההודעות האחרונות
// // // const messages = [];

// // // const run = async () => {
// // //   await consumer.connect();
// // //   await consumer.subscribe({
// // //     topic: "testsResults",
// // //     fromBeginning: true
// // //   });
// // //   await consumer.run({
// // //     eachMessage: async ({ message }) => {
// // //       // אחסן את ההודעה הנצרכת
// // //       message.push(1)
// // //       messages.push(message.value.toString());
      
// // //       // שמור רק על 10 ההודעות האחרונות
// // //       if (messages.length > 10) {
// // //         messages.shift();
// // //       }
// // //     },
// // //   });
// // // };

// // // run().catch(console.error);

// // // process.once("SIGINT", async () => {
// // //   try {
// // //     await consumer.disconnect();
// // //     console.log("Consumer disconnected");
// // //   } finally {
// // //     process.kill(process.pid, "SIGINT");
// // //   }
// // // });

// // // // ייצוא ההודעות כך שיהיו נגישות ל-Express
// // // module.exports = messages;

// // // consumer.js
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

// // const consumer = redpanda.consumer({ groupId: "consumer-group" });

// // const runConsumer = async (onMessage) => {
// //   await consumer.connect();
// //   await consumer.subscribe({ topic: "testsResults", fromBeginning: true });
  
// //   await consumer.run({
// //     eachMessage: async ({ topic, partition, message }) => {
// //       // פרסוב ההודעה מ-Buffer ל-JSON
// //       const msg = JSON.parse(message.value.toString());
// //       const userId = msg.userId;  // מזהה המשתמש בהודעה
// //       const currentUserId = req.session.user.id;  // מזהה המשתמש הנוכחי (ב-session)

// //       // אם ההודעה מיועדת למשתמש הנוכחי בלבד, אז נציג אותה
// //       if (userId === currentUserId) {
// //         const date = msg.date;
// //         const doctorName = msg.doctorName;
// //         const messageText = msg.message;

// //         console.log(`תאריך שליחת ההודעה: ${date}`);
// //         console.log(`שם הרופא: ${doctorName}`);
// //         console.log(`ההודעה: ${messageText}`);
// //       }
// //     }
// //   });
// //   // await consumer.run({
// //   //   // eachMessage: async ({ topic, partition, message }) => {
// //   //   //   const msg = {
// //   //   //     topic,
// //   //   //     partition,
// //   //   //     offset: message.offset,
// //   //   //     key: message.key && message.key.toString(),
// //   //   //     value: message.value && message.value.toString(),
// //   //   //   };
// //   //   //   onMessage(msg);
// //   //   // },
// //   //   eachMessage: async ({ topic, partition, message }) => {
// //   //     // כאן נקבל את ההודעה שנשלחה
// //   //     const msg = JSON.parse(message.value.toString());  // פרסוב ההודעה מ-Buffer ל-JSON
// //   //     const date = msg.date;  // התאריך
// //   //     const doctorName = msg.doctorName;  // שם הרופא
// //   //     const messageText = msg.message;  // התוכן של ההודעה

// //   //     // הצגת ההודעה בצורה קריאה
// //   //     console.log(`תאריך שליחת ההודעה: ${date}`);
// //   //     console.log(`שם הרופא: ${doctorName}`);
// //   //     console.log(`ההודעה: ${messageText}`);
// //   //   }
// //   // });
  
// // };

// // module.exports = { runConsumer };


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

// const consumer = redpanda.consumer({ groupId: "consumer-group" });

// const runConsumer = async (currentUserId,onMessage) => {

//   await consumer.connect();
//   await consumer.subscribe({ topic: "testsResults", fromBeginning: true });
//   await consumer.run({
    
//     eachMessage: async ({ topic, partition, message }) => {
//       // פרסוב ההודעה מ-Buffer ל-JSON
//       const msg = JSON.parse(message.value.toString());
//       const userId = msg.userId;  // מזהה המשתמש בהודעה
//       console.log(55)
//       console.log(userId)
//       console.log(currentUserId)
//       console.log(userId === currentUserId)
//       // אם ההודעה מיועדת למשתמש הנוכחי בלבד, אז נציג אותה
//       if (parseInt (userId) ===parseInt( currentUserId)) {
//         console.log(56)
//         onMessage({date:msg.date,doctorName: msg.doctorName,messageText : msg.message})
//         // console.log(`תאריך שליחת ההודעה: ${date}`);
//         // console.log(`שם הרופא: ${doctorName}`);
//         // console.log(`ההודעה: ${messageText}`);
//       }
//     }
    
//   });
// };

// // כאן תעביר את מזהה המשתמש הנוכחי כארגומנט לפונקציה
// // לדוגמה: 
// // runConsumer(currentUserId); 

// module.exports = { runConsumer };

const { Kafka } = require("kafkajs");

const redpanda = new Kafka({
  brokers: ["csovvkq0p8t14kkkbsag.any.eu-central-1.mpx.prd.cloud.redpanda.com:9092"],
  ssl: {},
  sasl: {
    mechanism: "scram-sha-256",
    username: "moshe",
    password: "HyCUNWFmeV0jyA5PUygv9cXt6CbLbG"
  }
});

const consumer = redpanda.consumer({ groupId: "consumer-group" });
const userMessages = {}; // Storing messages per userId

// const runConsumer = async (currentUserId, onMessage) => {
//   // await consumer.connect();
//   // await consumer.subscribe({ topic: "testsResults", fromBeginning: true });

//   if (!isConnected) { // Only connect and subscribe if not already connected
//     await consumer.connect();
//     await consumer.subscribe({ topic: "testsResults", fromBeginning: true });
//     isConnected = true;
//   }

//   await consumer.run({
//     eachMessage: async ({ message }) => {
//       const msg = JSON.parse(message.value.toString());
//       const { userId } = msg;

//       // Store each message by userId
//       if (!userMessages[userId])
//          userMessages[userId] = [];
//       userMessages[userId].push(msg);

//       // Call onMessage callback only if user is viewing their messages
//       if (parseInt(userId) === parseInt(currentUserId)) {
//         onMessage(userMessages[userId]);
//       }
//     }
//   });
// };

let isConnected = false;

const runConsumer = async (currentUserId, onMessage, onTimeout) => {
  if (!isConnected) {
    await consumer.connect();
    await consumer.subscribe({ topic: "testsResults", fromBeginning: true });
    isConnected = true;
  }

  const timeout = setTimeout(async () => {
    await consumer.disconnect();
    isConnected = false;
    onTimeout(); // Trigger timeout callback
  }, 5000); // Wait for 5 seconds before timing out

  await consumer.run({
    eachMessage: async ({message }) => {
      const msg = JSON.parse(message.value.toString());
      const userId = msg.userId;

      if (parseInt(userId) === parseInt(currentUserId)) {
        clearTimeout(timeout); // Clear timeout if a message is received
        onMessage({ date: msg.date, doctorName: msg.doctorName, messageText: msg.message });
      }
    },
  });
};


module.exports = { runConsumer, userMessages };



