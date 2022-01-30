const mediaConstraints = {
    audio: true,
    video: {
        width: { min: 1024, ideal: 1280, max: 1920 },
        height: { min: 576, ideal: 720, max: 1080 },
    },
};

let playButton,
    videoElement,
    mediaDevices,
    vidConstraints,
    audConstraints,
    vidTracks,
    audTracks,
    vidOn = false,
    audOn = false,
    cameraController,
    microphoneController;

const turnOn = () => {
    // Accessing the user camera and video.
    mediaDevices
        .getUserMedia(mediaConstraints)
        .then((stream) => {
            window.localStream = stream;
            console.log(stream);
            confAudTracks();
            confVidTracks();
            videoElement.srcObject = localStream;
            videoElement.addEventListener("loadedmetadata", () => {
                videoElement.play();
            });
        })
        .catch(alert);
};

const turnOff = () => {
    localStream.addTrack(vidTracks);
    localStream.addTrack(audTracks);
    window.localStream.getTracks().forEach((track) => track.stop());
    localStream = null;
    cameraController.innerText = "Camera Off";
    microphoneController.innerText = "Microphone Off";
    cameraController.disabled = true;
    microphoneController.disabled = true;
};

const turnOffAudio = () => {
    if (audOn && audTracks) {
        localStream.removeTrack(audTracks);
        vidTracks.muted = true;
        audOn = false;
        microphoneController.innerText = "Microphone Off";
    }
};

const turnOnAudio = () => {
    if (audTracks) {
        vidTracks.muted = false;
        audOn = true;
        microphoneController.innerText = "Microphone On";
    }
};

const turnOffVideo = () => {
    if (vidOn && vidTracks) {
        localStream.removeTrack(vidTracks);
        vidOn = false;
        cameraController.innerText = "Camera Paused";
    }
};

const turnOnVideo = () => {
    localStream.addTrack(vidTracks);
    vidOn = true;
    cameraController.innerText = "Camera Streaming";
};

document.addEventListener("DOMContentLoaded", () => {
    playButton = document.getElementById("playbutton");
    videoElement = document.getElementById("vid");
    cameraController = document.querySelector("#stop-vid");
    microphoneController = document.querySelector("#stop-aud");

    mediaDevices = navigator.mediaDevices;
    cameraController.disabled = true;
    microphoneController.disabled = true;
    cameraController.innerText = "Video Off";
    microphoneController.innerText = "Audio Off";

    vid.muted = true;
    cameraOn = false;

    playButton.addEventListener("click", () => {
        if (cameraOn) {
            turnOff();
            cameraOn = false;
        } else {
            turnOn();
            cameraOn = true;
        }
    });

    cameraController.addEventListener("click", (e) => {
        if (vidOn) {
            turnOffVideo();
        } else {
            turnOnVideo();
        }
    });

    microphoneController.addEventListener("click", (e) => {
        if (audOn) {
            turnOffAudio();
        } else {
            turnOnAudio();
        }
    });
});

function confAudTracks() {
    if (localStream.getAudioTracks().length > 0) {
        microphoneController.disabled = false;
        microphoneController.innerText = "Audio On";
        audOn = true;
        audTracks = localStream.getAudioTracks()[0];
        audConstraints = audTracks.getConstraints();
        console.log(`\nAudio constraints: ${JSON.stringify(audConstraints)}\n`);
    }
}

function confVidTracks() {
    if (localStream.getVideoTracks().length > 0) {
        cameraController.disabled = false;
        cameraController.innerText = "Camera Streaming";
        vidOn = true;
        vidTracks = localStream.getVideoTracks()[0];
        vidConstraints = vidTracks.getConstraints();
        console.log(`\nVideo constraints: ${JSON.stringify(vidConstraints)}\n`);
    }
}
