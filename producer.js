//temporary code
// producer.js
const { Kafka } = require('kafkajs');

const kafka = new Kafka({
    brokers: ["csovvkq0p8t14kkkbsag.any.eu-central-1.mpx.prd.cloud.redpanda.com:9092"],
    ssl: {},
    sasl: {
      mechanism: "scram-sha-256",
      username: "moshe",
      password: "HyCUNWFmeV0jyA5PUygv9cXt6CbLbG"
    }
  });
const producer = kafka.producer();

const runProducer = async (userId) => {
  await producer.connect();
  console.log('Producer connected to Kafka');

  // Sending a test message to the "user-messages" topic
  await producer.send({
    topic:  "testsResults",
    messages: [{key:JSON.stringify(userId), value:  JSON.stringify(
        {
            date: new Date().toISOString(),
            doctorName: "Dr. Moshe",
             message: `Your sugar level is stable. ${userId}`


        }
    )
     }],
  });

  console.log('Message sent to Kafka');
  await producer.disconnect();
};

runProducer("123456789").catch(console.error);
runProducer("325984318").catch(console.error);




































// // // producer.js
// // const os = require("os");
// // const { Kafka, CompressionTypes } = require("kafkajs");

// // const redpanda = new Kafka({
// //   brokers: ["csovvkq0p8t14kkkbsag.any.eu-central-1.mpx.prd.cloud.redpanda.com:9092"],
// //   ssl: {},
// //   sasl: {
// //     mechanism: "scram-sha-256",
// //     username: "moshe",
// //     password: "HyCUNWFmeV0jyA5PUygv9cXt6CbLbG"
// //   }
// // });
// // const producer = redpanda.producer();

// // const sendMessage = (msg) => {
// //   return producer.send({
// //     topic: "demo-topic",
// //     compression: CompressionTypes.GZIP,
// //     messages: [{
// //       key: os.hostname(),
// //       value: JSON.stringify(msg)
// //     }]
// //   }).catch((e) => {
// //     console.error(`Unable to send message: ${e.message}`, e);
// //   });
// // };

// // const run = async () => {
// //   await producer.connect();
// //   for (let i = 0; i < 100; i++) {
// //     sendMessage(`message ${i}`).then((resp) => {
// //       console.log(`Message sent: ${JSON.stringify(resp)}`);
// //     });
// //   }
// // };

// // run().catch(console.error);

// // process.once("SIGINT", async () => {
// //   try {
// //     await producer.disconnect();
// //     console.log("Producer disconnected");
// //   } finally {
// //     process.kill(process.pid, "SIGINT");
// //   }
// // });

// //מה שטוב עעד עכשיו
// const os = require("os");
// const { Kafka, CompressionTypes } = require("kafkajs");

// const redpanda = new Kafka({
//   brokers: ["csovvkq0p8t14kkkbsag.any.eu-central-1.mpx.prd.cloud.redpanda.com:9092"],
//   ssl: {},
//   sasl: {
//     mechanism: "scram-sha-256",
//     username: "moshe",
//     password: "HyCUNWFmeV0jyA5PUygv9cXt6CbLbG"
//   }
// });
// const producer = redpanda.producer();

// // הפונקציה ששולחת את ההודעה
// const sendMessage = (msg) => {
//   console.log("Sending message:", msg); // הודעה שתציג אם ההודעה נשלחת
//   return producer.send({
//     topic: "testsResults",
//     compression: CompressionTypes.GZIP,
//     messages: [{
//       // key: os.hostname(),
//       value: JSON.stringify(msg)
//     }]
//   }).catch((e) => {
//     console.error(`Unable to send message: ${e.message}`, e);
//   });
// };


// // הפונקציה שמבצעת את החיבור ושליחת ההודעות
// const run = async () => {
//   await producer.connect();

//   // הדוגמה להודעה שברצונך לשלוח
//   const message = {
//     userId: "123456789", // מזהה המשתמש
//     date: "2024-11-12T10:00:00Z", // תאריך שליחת ההודעה
//     doctorName: "dr. moshe", // שם הרופא
//     message: "רמת הסוכר שלך תקינה" // תוכן ההודעה
//   };

//   // שולחים את ההודעה
//   sendMessage(message).then((resp) => {
//     console.log(`Message sent: ${JSON.stringify(resp)}`);
//   });

// };

// run().catch(console.error);

// // חיבור מחדש של ה-Producer כשמתקבלת הפסקה
// process.once("SIGINT", async () => {
//   try {
//     await producer.disconnect();
//     console.log("Producer disconnected");
//   } finally {
//     process.kill(process.pid, "SIGINT");
//   }
// });

// //עד כאן

