// const express = require("express");
import express from "express";
import { Server } from "socket.io";
import http from "http";
import path from "path";
import {
  log,
  cls,
  successMessage,
  infoMessage,
  stringify,
  keys,
} from "./custom_modules/index.js";

const PORT = 3000,
  ADDRESS = "0.0.0.0";

const __dirname = path.resolve(".");
const app = express();
// const http = require("http");
const server = http.createServer(app);
const io = new Server(server);

// Static assets
app.use(express.static(path.join(__dirname, "public")));

app.get("/", (req, res) => {
  res.sendFile(__dirname + "/index.html");
});

let connectedPeers = [];

io.on("connection", (socket) => {
  connectedPeers.push({ uid: socket.id });
  console.log(`\n\tClient ${socket.id} connected`);
  logPeers();

  socket.on("preoffer", (data) => {
    const { calleePersonalCode, callType } = data;

    console.log(
      `\n\tPreoffer sent by ${
        socket.id
      } to ${calleePersonalCode}\n\tData:\t${JSON.stringify(data)}`
    );

    const connectedPeer = connectedPeers.find(
      (x) => x.uid == calleePersonalCode
    );

    if (connectedPeer) {
      const data = {
        callerSocketId: socket.id,
        callType,
      };

      io.to(calleePersonalCode).emit("preoffer", data);
    } else {
      const data = { preOfferAnswer: "CALLEE_NOT_FOUND" };
      io.to(socket.id).emit("preofferanswer", data);
    }
  });

  socket.on("preofferanswer", (data) => {
    console.log(`\n\tPre offer answer came\n\tData: ${JSON.stringify(data)}`);

    const { callerSocketId, preOfferAnswer } = data;

    const connectedPeer = connectedPeers.find(
      (peer) => peer.uid == callerSocketId
    );

    if (connectedPeer) {
      io.to(callerSocketId).emit("preofferanswer", data);
    }
  });

  socket.on("disconnect", () => {
    console.log(`\n\tUser ${socket.id} disconnected`);
    const newConnectedPeers = connectedPeers.filter(
      (peer) => peer.uid !== socket.id
    );

    connectedPeers = newConnectedPeers;
    logPeers();
  });

  socket.on("webrtcsignaling", (data) => {
    const { connectedUserSocketId } = data;

    console.log(
      `\n\tReceived web rtc signaling event from ${socket.id}\n\tSending data to ${connectedUserSocketId}`
    );

    const connectedPeer = connectedPeers.find(
      (peer) => peer.uid == connectedUserSocketId
    );

    if (connectedPeer) {
      io.to(connectedUserSocketId).emit("webrtcsignaling", data);
    } else {
      console.log(
        `\n\tError within the io server webrtcsignaling event handler\n\tReceived data: ${JSON.stringify(
          data
        )}`
      );
    }
  });
});

server.listen(PORT, ADDRESS, () => {
  cls();
  log(
    successMessage(
      `\n\t\tServer listening on *:3000\n\t\tServer Address: ${server._connectionKey}\n\n`
    )
  );
});

function logPeers() {
  console.log(infoMessage(`\n\tConnected Peers: ${connectedPeers.length}`));
  if (connectedPeers.length > 0) {
    connectedPeers.forEach((p) => console.log(`\t\t${p.uid}`));
  }
}
