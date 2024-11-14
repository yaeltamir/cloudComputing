// wsServer.js
const WebSocket = require("ws");
const { getMessages } = require("./messageStore");

const setupWebSocket = (server) => {
  const wss = new WebSocket.Server({ server });

  wss.on("connection", (ws, req) => {
    ws.on("message", (userId) => {
      // Retrieve messages for this userId from the messageStore
      const messages = getMessages(userId);
      ws.send(JSON.stringify(messages));
    });
  });

  return wss;
};

module.exports = setupWebSocket;
