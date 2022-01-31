import * as constants from "./constants.js";
import * as elements from "./elements.js";
import * as utils from "./utils.js";

// ui helper functions

const getLeftMessage = (message) => {
  const messageContainer = utils.newElement("div");
  const messageParagraph = utils.newElement("p");
  messageParagraph.innerHTML = message;

  utils.addAttribute(messageContainer, "class", "them");

  utils.appendChild(messageContainer, messageParagraph);
  return messageContainer;
};

const getRightMessage = (message) => {
  const messageContainer = utils.newElement("div");
  const messageParagraph = utils.newElement("p");
  messageParagraph.innerHTML = message;

  utils.addAttribute(messageContainer, "class", "me");

  utils.appendChild(messageContainer, messageParagraph);
  return messageContainer;
};

const enableDashboard = () => {
  const dashboadBlur = elements.dashboardBlur;

  if (!dashboadBlur.classList.contains("display-none")) {
    dashboadBlur.classList.add("display-none");
  }
};

const disableDashboard = () => {
  const dashboadBlur = elements.dashboardBlur;
  utils.log(`\n\tDisabling the dashboard\n`);

  if (dashboadBlur.classList.contains("display-none")) {
    dashboadBlur.classList.remove("display-none");
  }
};

const hideElement = (element) => {
  if (!element.classList.contains("display-none")) {
    element.classList.add("display-none");
  }
};

const showElement = (element) => {
  if (element.classList.contains("display-none")) {
    element.classList.remove("display-none");
  }
};

const showChatCallElements = () => {
  const finishChatButtonContainer = elements.finishChatButtonContainer;
  const newMessageContainer = elements.newMessageContainer;

  showElement(finishChatButtonContainer);
  showElement(newMessageContainer);
  disableDashboard();
};

const hideChatCallElements = () => {
  const finishChatButtonContainer = elements.finishChatButtonContainer;
  const newMessageContainer = elements.newMessageContainer;

  hideElement(finishChatButtonContainer);
  hideElement(newMessageContainer);
  enableDashboard();
};

const showVideoCallElements = () => {
  const videoPlaceholder = elements.videoPlaceholder;
  const callButtons = elements.callButtonsContainer;
  const finishChatButtonContainer = elements.finishChatButtonContainer;
  const videoButtons = elements.videoRecordingButtonsContainer;
  const newMessageContainer = elements.newMessageContainer;
  const remoteVideo = elements.remoteVideo;

  hideElement(videoPlaceholder);
  showElement(callButtons);
  showElement(finishChatButtonContainer);
  showElement(remoteVideo);
  showElement(videoButtons);
  showElement(newMessageContainer);

  disableDashboard();
};

const hideVideoCallElements = () => {
  const videoPlaceholder = elements.videoPlaceholder;
  const callButtons = elements.callButtonsContainer;
  const finishChatButtonContainer = elements.finishChatButtonContainer;
  const videoButtons = elements.videoRecordingButtonsContainer;
  const newMessageContainer = elements.newMessageContainer;
  const remoteVideo = elements.remoteVideo;

  showElement(videoPlaceholder);
  hideElement(callButtons);
  hideElement(finishChatButtonContainer);
  hideElement(remoteVideo);
  hideElement(videoButtons);
  hideElement(newMessageContainer);

  enableDashboard();
};

const noVideoDevice = () => {
  const localVideoContainer = elements.localVideoContainer;
  const localVideo = elements.localVideo;
  const personalCodeVideoButton = elements.personalCodeVideoButton;
  const strangerCodeVideoButton = elements.strangerCodeVideoButton;
  localVideoContainer.classList.add('hide');
  localVideo.classList.add('hide');
  personalCodeVideoButton.classList.add('hide');
  strangerCodeVideoButton.classList.add('hide');
};

// Exported functions

export const updateLocalVideo = (stream) => {
  const localVideo = elements.localVideo;
  localVideo.srcObject = stream;

  utils.addHandler(localVideo, "loadmetadata", () => {
    localVideo.play();
  });
};

export const updateRemoteVideo = (stream) => {
  const remoteVideo = elements.remoteVideo;
  remoteVideo.srcObject = stream;
};

export const updatePersonalCode = (personalCode) => {
  elements.personalCodeParagraph.innerHTML = personalCode;
};

export const showIncomingCallRequest = (
  callType,
  acceptCallHandler,
  rejectCallHandler
) => {
  const callTypeInfo =
    callType === constants.callType.CHAT_PERSONAL_CODE ? "chat" : "video";

  const incomingCallDialog = elements.getIncomingCallDialog(
    callTypeInfo,
    acceptCallHandler,
    rejectCallHandler
  );

  // Remove all dialogs
  const parentDialog = utils.getElement("dialog");
  utils.removeChildren(parentDialog);
  utils.appendChild(parentDialog, incomingCallDialog);
};

export const showCallingDialog = (rejectCallHandler) => {
  const callingDialog = elements.showCallingDialog(rejectCallHandler);

  // Remove all dialogs
  const parentDialog = utils.getElement("dialog");
  utils.removeChildren(parentDialog);
  utils.appendChild(parentDialog, callingDialog);
  utils.appendChild(parentDialog, callingDialog);
};

export const showCallingAlert = (rejectCallHandler) => {
  elements.showCallingAlert(rejectCallHandler);
};

export const removeAllDialogs = () => {
  const dialog = document.querySelector("#dialog");
  utils.removeChildren(dialog);
};

export const showCallElements = (callType) => {
  if (callType === constants.callType.CHAT_PERSONAL_CODE) {
    showChatCallElements();
  }

  if (callType === constants.callType.VIDEO_PERSONAL_CODE) {
    showVideoCallElements();
  }
};

export const showInfoDialog = (preOfferAnswer) => {
  let infoDialog = null;

  if (preOfferAnswer === constants.preOfferAnswer.CALL_REJECTED) {
    infoDialog = elements.getInfoDialog(
      "Call rejected",
      "Callee rejected your call"
    );
  }

  if (preOfferAnswer === constants.preOfferAnswer.CALLEE_NOT_FOUND) {
    infoDialog = elements.getInfoDialog(
      "Callee not found",
      "Please  check personal code"
    );
  }

  if (preOfferAnswer === constants.preOfferAnswer.CALL_UNAVAILABLE) {
    infoDialog = elements.getInfoDialog(
      "Call is not possible",
      "Probably busy try again later"
    );
  }

  if (infoDialog) {
    const dialog = utils.getElement("dialog");
    utils.appendChild(dialog, infoDialog);

    setTimeout(() => {
      removeAllDialogs();
    }, [4000]);
  }
};

export const updateMicButton = (buttonActive) => {
  const enabled = '<i class="fas fa-microphone fa-fw fa-2x"></i>';
  const disabled = '<i class="fas fa-microphone-slash fa-fw fa-2x"></i>';
  elements.micButton.innerHTML = buttonActive ? disabled : enabled;
};

export const updateCameraButton = (cameraActive) => {
  elements.cameraButton.enabled = cameraActive ? true : false;
};

export const appendMessage = (message, right = false) => {
  const messagesContainer = elements.messagesContainer;
  const messageElement = right ?
    getRightMessage(message) :
    getLeftMessage(message);
  utils.appendChild(messagesContainer, messageElement);
};

export const clearMessenger = () => {
  const messagesContainer = elements.messagesContainer;
  utils.removeChildren(messagesContainer);
};

export const hideLocalVideoContainer = () => {
  noVideoDevice();
};