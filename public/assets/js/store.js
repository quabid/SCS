import { log, cls, parse, stringify, table } from "./utils.js";

let state = {
  socketId: null,
  localStream: null,
  remoteStream: null,
  screenSharingStream: null,
  allowConnectionsFromStrangers: false,
  screenSharingActive: false,
};

export const setSocketId = (socketId) => {
  state = {
    ...state,
    socketId,
  };

  log(`\n\t\tThe state has been updated ${stringify(state)}`);
};

export const setLocalStream = (stream) => {
  state = {
    ...state,
    localStream: stream,
  };
};

export const setAllowConnectionsFromStrangers = (allowConnection) => {
  state = {
    ...state,
    allowConnectionsFromStrangers: allowConnection,
  };
};

export const setAllowScreenSharingActive = (screenSharingActive) => {
  state = {
    ...state,
    screenSharingActive,
  };
};

export const setScreenSharingStream = (stream) => {
  state = {
    ...state,
    screenSharingStream: stream,
  };
};

export const setRemoteStream = (stream) => {
  state = {
    ...state,
    remoteStream: stream,
  };
};

export const getState = () => {
  return state;
};
