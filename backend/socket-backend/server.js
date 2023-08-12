const express = require("express");
const path = require("path");

const app = express();

const http = require("http");
const { Server } = require("socket.io");
const server = http.createServer(app);

const cors = require("cors");
app.use(cors());

const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"],
  },
});

io.on("connection", function (socket) {
  // listens the request for the sender to join to the
  // specified joinId
  socket.on("sender_join", function (data) {
    socket.join(data.sender_id);
  });

  // listens the request for the receiver to join to the
  // senders joinId and signals the sender that receiver had
  // joined and process can be proceeded
  socket.on("receiver_join", function (data) {
    socket.join(data.receiver_id);
    socket.in(data.sender_id).emit("initiate", data.receiver_id);
  });

  socket.on("share_meta_data", function (data) {
    console.log("meta data shared", data.receiver_id);
    socket.in(data.receiver_id).emit("get_meta_data", data.meta_data);
  });

  socket.on("file_share_start", function (data) {
    socket.in(data.sender_id).emit("file_share", {});
  });

  socket.on("share_raw_file", function (data) {
    socket.in(data.receiver_id).emit("get_raw_file", data.buffer);
  });
});

server.listen(5001, () => console.log("server live"));
