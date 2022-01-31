import * as store from "./store.js";
import * as wss from "./wss.js";
import * as webRTCHandler from "./webrtchandler.js";
import * as constants from "./constants.js";
import * as elements from "./elements.js";
import { addHandler, log } from "./utils.js";
import * as ui from "./ui.js";

const getTurnServerCredentials = async () => {
  const responseData = await axios.get("/api/get-turn-credentials");
  log("\n\tTURN Credentials\n" + JSON.stringify(responseData.data));
  webRTCHandler.setTurnServers(responseData.data.iceServers);
};

// init socket connection
const socket = io("/");
wss.registerSocketEvents(socket);

getTurnServerCredentials()
  .then(() => {
    webRTCHandler.getLocalPreview();
  })
  .catch((err) => {
    log(err);
  });

// register event listener for personal code button
addHandler(elements.personalCodeCopyButton, "click", () => {
  const personalCode = store.getState().socketId;
  log(`\n\tPersonal Code ${personalCode} copied to clipboard`);
  navigator.clipboard && navigator.clipboard.writeText(personalCode);
});

// register listeners for connetion buttons
addHandler(elements.personalCodeChatButton, "click", () => {
  log("Personal chat button clicked");

  const calleePersonalCode = elements.personalCodeInput.value;
  const callType = constants.callType.CHAT_PERSONAL_CODE;

  webRTCHandler.sendPreOffer(callType, calleePersonalCode);
});

addHandler(elements.personalCodeVideoButton, "click", () => {
  log("Personal video button clicked");

  const calleePersonalCode = elements.personalCodeInput.value;
  const callType = constants.callType.VIDEO_PERSONAL_CODE;

  webRTCHandler.sendPreOffer(callType, calleePersonalCode);
});

// register listener for mic-button
addHandler(elements.micButton, "click", () => {
  const localStream = store.getState().localStream;
  const micEnabled = localStream.getAudioTracks()[0].enabled;
  localStream.getAudioTracks()[0].enabled = !micEnabled;
  elements.micButton.enabled = micEnabled;
  ui.updateMicButton(micEnabled);
});

// register listener for camera-button
addHandler(elements.cameraButton, "click", () => {
  console.log(`\n\tDisabling camera`);
  const localStream = store.getState().localStream;
  const cameraEnabled = localStream.getVideoTracks()[0].enabled;
  localStream.getVideoTracks()[0].enabled = !cameraEnabled;
  ui.updateCameraButton(cameraEnabled);
});

// register listener for screen-sharing-button
addHandler(elements.screenSharingButton, "click", () => {
  const screenSharingActive = store.getState().screenSharingActive;

  webRTCHandler.switchBetweenCameraAndScreenSharing(screenSharingActive);
});

// messenger input
addHandler(elements.newMessageInput, "keydown", (event) => {
  log(`Message input activity`);

  const key = event.key;

  if (key === "Enter") {
    webRTCHandler.sendMessageUsingDataChannel(event.target.value);
    ui.appendMessage(event.target.value, true);
    elements.newMessageInput.value = "";
  }
});

// send message button
addHandler(elements.sendMessageButton, "click", () => {
  const message = elements.newMessageInput.value;
  webRTCHandler.sendMessageUsingDataChannel(message);
  ui.appendMessage(event.target.value, true);
  elements.newMessageInput.value = "";
});
