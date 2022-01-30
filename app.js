// const express = require("express");
import express from "express";
import { Server } from "socket.io";
import twilio from "twilio";
import dotenv from "dot-env";
import axios from "axios";
import https from "https";
import path from "path";
import { fs } from "mz";
import {
  log,
  cls,
  successMessage,
  infoMessage,
  stringify,
  keys,
} from "./custom_modules/index.js";

const PORT = 8443,
  ADDRESS = "0.0.0.0";
const options = letsencryptOptions("rmediatech.com");
const __dirname = path.resolve(".");
const app = express();

app.all("/*", function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "GET,PUT,POST,DELETE,OPTIONS");
  res.header(
    "Access-Control-Allow-Headers",
    "Content-Type, Authorization, Content-Length, X-Requested-With, *"
  );
  next();
});

const server = https.createServer(options, app);
const io = new Server(server);

// Static assets
app.use(express.static(path.join(__dirname, "public")));

app.get("/", (req, res) => {
  res.sendFile(__dirname + "/index.html");
});

app.get("/api/get-turn-credentials", (req, res) => {
  const accountSid = procees.env.ACCOUNT_SID;
  const authToken = process.env.AUTH_TOKEN;
  const client = twilio(accountSid, authToken);
  client.tokens
    .create()
    .then((token) => {
      res.send(token);
    })
    .catch((err) => {
      log("\n\t" + err);
      res.send({ message: "failed to get token" });
    });
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
      `\n\t\tServer listening on *:${PORT}\n\t\tServer Address: ${server._connectionKey}\n\n`
    )
  );
});

function logPeers() {
  console.log(infoMessage(`\n\tConnected Peers: ${connectedPeers.length}`));
  if (connectedPeers.length > 0) {
    connectedPeers.forEach((p) => console.log(`\t\t${p.uid}`));
  }
}

function letsencryptOptions(domain) {
  const path = "/etc/letsencrypt/live/";
  return {
    key: fs.readFileSync(path + domain + "/privkey.pem"),
    cert: fs.readFileSync(path + domain + "/cert.pem"),
    ca: fs.readFileSync(path + domain + "/chain.pem"),
  };
}
