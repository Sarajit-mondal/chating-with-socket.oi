const express = require("express");
const dotenv = require("dotenv");
const { chats } = require("./backend/data/data");
dotenv.config();
const app = express();
const port = 3000;

app.get("/", (req, res) => {
  res.send("server is running......");
});

app.get("/api/chat", (req, res) => {
  res.send(chats);
});

app.listen(port, () => {
  console.log(`http://localhost:${port}`);
});
