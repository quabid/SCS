import * as wss from "./wss.js";
import * as constants from "./constants.js";
import * as ui from "./ui.js";
import * as store from "./store.js";

let screenSharingStream;
let connectedUserDetails;
let peerConnection;
let dataChannel;
let turnServers = [];

export const setTurnServers = (servers) => {
  turnServers = servers;
};

const defaultMediaContraints = {
  audio: true,
  video: true,
}; /* 

const configuration = {
  iceServers: [
    {
      urls: "stun:stun.1.google.com:13902",
    },
  ],
}; */

export const getLocalPreview = () => {
  navigator.mediaDevices
    .getUserMedia(defaultMediaContraints)
    .then((stream) => {
      ui.updateLocalVideo(stream);
      store.setLocalStream(stream);
    })
    .catch((error) => {
      console.log(`\n\tError ocurred while attempting to access camera`);

      console.log("\n\t\t" + error);
    });
};

export const sendPreOffer = (callType, calleePersonalCode) => {
  connectedUserDetails = {
    callType,
    calleePersonalCode,
  };

  if (
    callType === constants.callType.CHAT_PERSONAL_CODE ||
    callType == constants.callType.VIDEO_PERSONAL_CODE
  ) {
    const data = {
      callType,
      calleePersonalCode,
    };

    ui.showCallingDialog(callingDialogRejectCallHandler);
    // ui.showCallingAlert(callingDialogRejectCallHandler);

    wss.sendPreOffer(data);
  }
};

export const handlePreOffer = (data) => {
  console.log(
    `\n\thandlePreoffer method invoked\n\tData:\t${JSON.stringify(data)}`
  );

  const { callType, callerSocketId } = data;

  connectedUserDetails = {
    socketId: callerSocketId,
    callType,
  };

  if (
    callType === constants.callType.CHAT_PERSONAL_CODE ||
    callType === constants.callType.VIDEO_PERSONAL_CODE
  ) {
    console.log(`\n\tHandling the pre offer\n\tShowing call dialog`);
    ui.showIncomingCallRequest(callType, acceptCallHandler, rejectCallHandler);
  }
};

export const handlePreOfferAnswer = (data) => {
  console.log(`\n\tHandling pre offer answer\n\tData: ${JSON.stringify(data)}`);
  const { preOfferAnswer } = data;

  ui.removeAllDialogs();

  if (preOfferAnswer === constants.preOfferAnswer.CALLEE_NOT_FOUND) {
    // show dialog callee not found
    ui.showInfoDialog(preOfferAnswer);
  }

  if (preOfferAnswer === constants.preOfferAnswer.CALL_UNAVAILABLE) {
    // show dialog callee not able to connect
    ui.showInfoDialog(preOfferAnswer);
  }

  if (preOfferAnswer === constants.preOfferAnswer.CALL_REJECTED) {
    // show dialog callee rejected call
    ui.showInfoDialog(preOfferAnswer);
  }

  if (preOfferAnswer === constants.preOfferAnswer.CALL_ACCEPTED) {
    // send webRTC answer
    ui.showCallElements(connectedUserDetails.callType);
    createPeerConnection();
    sendWebRtcOffer();
  }
};

export const handleWebRtcOffer = async (data) => {
  console.log(
    `\n\tReceived web rtc offer\n\tThe data: ${JSON.stringify(data)}`
  );

  await peerConnection.setRemoteDescription(data.offer);
  const answer = await peerConnection.createAnswer();
  await peerConnection.setLocalDescription(answer);
  wss.sendDataUsingWebRtcSignaling({
    connectedUserSocketId: connectedUserDetails.socketId,
    type: constants.webRtcSignaling.ANSWER,
    answer: answer,
  });
};

export const handleWebRtcAnswer = async (data) => {
  console.log(
    `\n\tReceived web rtc answer\n\tData:\n\t\t${JSON.stringify(data)}`
  );
  await peerConnection.setRemoteDescription(data.answer);
};

export const handleWebRtcCandidate = async (data) => {
  try {
    await peerConnection.addIceCandidate(data.candidate);
  } catch (error) {
    console.log(`\n\tError ocurred when attempted to received ice candidate`);
    console.log("\t" + error);
  }
};

export const switchBetweenCameraAndScreenSharing = async (
  screenSharingActive
) => {
  if (screenSharingActive) {
  } else {
    try {
      screenSharingStream = await navigator.mediaDevices.getDisplayMedia({
        video: true,
      });

      store.setScreenSharingStream(screenSharingStream);

      // replace track
      const senders = peerConnection.getSenders();
      const sender = senders.find(
        (s) => s.track.kind === screenSharingStream.getVideoTracks()[0].kind
      );

      if (sender) {
        sender.replaceTrack(screenSharingStream.getVideoTracks()[0]);
      }

      store.setAllowScreenSharingActive(!screenSharingActive);

      ui.updateLocalVideo(screenSharingStream);
    } catch (error) {
      console.log(
        `\n\tError ocurred when attemptng to get screen sharing stream`
      );
      console.log("\n\t" + error);
      return;
    }
  }
};

const sendWebRtcOffer = async () => {
  console.log(
    `\n\tSending web rtc offer method invoked\n\tConnected User Details ${JSON.stringify(
      connectedUserDetails
    )}`
  );

  const offer = await peerConnection.createOffer();

  await peerConnection.setLocalDescription(offer);

  wss.sendDataUsingWebRtcSignaling({
    connectedUserSocketId: connectedUserDetails.calleePersonalCode,
    type: constants.webRtcSignaling.OFFER,
    offer: offer,
  });
};

const createPeerConnection = () => {
  const configuration = {
    iceServers: [
      ...turnServers,
      {
        url: "stun:stun.1.google.com:13902",
      },
    ],
    // iceTransportPolicy: "relay",
  };
  peerConnection = new RTCPeerConnection(configuration);

  peerConnection.onicecandidate = (event) => {
    console.log(`\n\tGetting ice candidate from stun server`);

    if (event.candidate) {
      // Send our ice candidate to the other peer
      wss.sendDataUsingWebRtcSignaling({
        connectedUserSocketId: connectedUserDetails.socketId,
        type: constants.webRtcSignaling.ICE_CANDIDATE,
        candidate: event.candidate,
      });
    }
  };

  peerConnection.onconnectionstatechange = (event) => {
    if (peerConnection.connectionState === "connected") {
      console.log(`\n\tSuccessfully connected with the other peer`);
    }
  };

  // receiving media tracks
  const remoteStream = new MediaStream();
  store.setRemoteStream(remoteStream);
  ui.updateRemoteVideo(remoteStream);

  peerConnection.ontrack = (event) => {
    remoteStream.addTrack(event.track);
  };

  // add our stream to peer connection

  if (
    connectedUserDetails.callType === constants.callType.VIDEO_PERSONAL_CODE
  ) {
    const localStream = store.getState().localStream;
    for (const track of localStream.getTracks()) {
      peerConnection.addTrack(track, localStream);
    }
  }
};

function acceptCallHandler() {
  console.log(`Call accepted`);
  createPeerConnection();
  sendPreOfferAnswer(constants.preOfferAnswer.CALL_ACCEPTED);
  ui.showCallElements(connectedUserDetails.callType);
}

function rejectCallHandler() {
  console.log(`Call rejected`);
  sendPreOfferAnswer(constants.preOfferAnswer.CALL_REJECTED);
}

function sendPreOfferAnswer(preOfferAnswer) {
  const data = {
    callerSocketId: connectedUserDetails.socketId,
    preOfferAnswer,
  };

  console.log(
    `\n\tSend pre offer answer to caller\n\tData:\t${JSON.stringify(
      preOfferAnswer
    )}`
  );

  ui.removeAllDialogs();
  wss.sendPreOfferAnswer(data);
}

function callingDialogRejectCallHandler() {
  console.log(`\n\tRejecting the call`);
}
