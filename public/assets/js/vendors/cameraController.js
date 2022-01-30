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
    audio,
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
            turnOffAudio();
        })
        .catch(alert);
};

const turnOff = () => {
    localStream.addTrack(vidTracks);
    localStream.addTrack(audTracks);
    window.localStream.getTracks().forEach((track) => track.stop());
    audio.muted = true;
    localStream = null;
    cameraController.innerText = "Camera Off";
    microphoneController.innerText = "Audio Off";
    cameraController.disabled = true;
    microphoneController.disabled = true;
};

const turnOffAudio = () => {
    if (audOn && audTracks) {
        // localStream.removeTrack(audTracks);
        audio.muted = true;
        audOn = false;
        microphoneController.innerText = "Audio Off";
    }
};

const turnOnAudio = () => {
    if (audTracks) {
        // localStream.addTrack(audTracks);
        audio.muted = false;
        audOn = true;
        microphoneController.innerText = "Audio On";
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

    cameraOn = false;
    audio = vid;
    audio.muted = true;

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
        microphoneController.innerText = "Audio Off";
        audOn = false;
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
