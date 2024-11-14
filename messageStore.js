// messageStore.js
const messageStore = {};

// Function to add a message for a specific userId
const addMessage = (userId, message) => {
  if (!messageStore[userId]) {
    messageStore[userId] = [];
  }
  messageStore[userId].push(message);
};

// Function to retrieve messages for a specific userId
const getMessages = (userId) => {
  return messageStore[userId] || [];
};

// Export the message store and functions for external access
module.exports = { messageStore, addMessage, getMessages };
