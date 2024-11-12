// producer.js
const os = require("os");
const { Kafka, CompressionTypes } = require("kafkajs");

const redpanda = new Kafka({
  brokers: ["csovvkq0p8t14kkkbsag.any.eu-central-1.mpx.prd.cloud.redpanda.com:9092"],
  ssl: {},
  sasl: {
    mechanism: "scram-sha-256",
    username: "moshe",
    password: "HyCUNWFmeV0jyA5PUygv9cXt6CbLbG"
  }
});
const producer = redpanda.producer();

const sendMessage = (msg) => {
  return producer.send({
    topic: "demo-topic",
    compression: CompressionTypes.GZIP,
    messages: [{
      key: os.hostname(),
      value: JSON.stringify(msg)
    }]
  }).catch((e) => {
    console.error(`Unable to send message: ${e.message}`, e);
  });
};

const run = async () => {
  await producer.connect();
  for (let i = 0; i < 100; i++) {
    sendMessage(`message ${i}`).then((resp) => {
      console.log(`Message sent: ${JSON.stringify(resp)}`);
    });
  }
};

run().catch(console.error);

process.once("SIGINT", async () => {
  try {
    await producer.disconnect();
    console.log("Producer disconnected");
  } finally {
    process.kill(process.pid, "SIGINT");
  }
});
