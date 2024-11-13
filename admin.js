// admin.js
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
const admin = redpanda.admin();

admin.connect().then(() => {
  admin.createTopics({
    topics: [{
      topic: "demo-topic",
      numPartitions: 1,
      replicationFactor: -1
    }]
  })
  .then((resp) => {
    resp ? console.log("Created topic") : console.log("Failed to create topic");
  })
  .finally(() => admin.disconnect());
}).catch(console.error);
