// consumer.js
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
const consumer = redpanda.consumer({ groupId: 'consumer-group' });

const run = async () => {
  await consumer.connect();
  await consumer.subscribe({
    topic: "demo-topic",
    fromBeginning: true
  });
  await consumer.run({
    eachMessage: async ({ topic, partition, message }) => {
      const topicInfo = `topic: ${topic} (${partition}|${message.offset})`;
      const messageInfo = `key: ${message.key}, value: ${message.value}`;
      console.log(`Message consumed: ${topicInfo}, ${messageInfo}`);
    },
  });
};

run().catch(console.error);

process.once("SIGINT", async () => {
  try {
    await consumer.disconnect();
    console.log("Consumer disconnected");
  } finally {
    process.kill(process.pid, "SIGINT");
  }
});
