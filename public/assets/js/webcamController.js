const mediaConstraints = { video: true, audio: true };

let playButton,
    videoElement,
    mediaDevices,
    mediaRecorder,
    vidConstraints,
    audConstraints,
    audio,
    vidTracks,
    audTracks,
    recordButton,
    vidSrc,
    vidOn = false,
    audOn = false,
    blob,
    cameraController,
    microphoneController;

const turnOn = () => {
    // Accessing the user camera and video.
    mediaDevices
        .getUserMedia(mediaConstraints)
        .then((stream) => {
            window.localStream = stream;
            console.log(
                "\n\t\t\t\tThe Stream Object\n\t\t\t\t\t" + stream + "\n\n\n"
            );
            confMediaRecorder();
            confAudTracks();
            confVidTracks();
            videoElement.srcObject = localStream;
            // videoElement.src = window.URL.createObjectURL(localStream);
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
    if (null != mediaRecorder) {
        mediaRecorder.stop();
        mediaRecorder = null;
    }
    audio.muted = true;
    localStream = null;
    cameraController.innerText = "Camera Off";
    microphoneController.innerText = "Audio Off";
    recordButton.innerText = "Stopped";
    cameraController.disabled = true;
    microphoneController.disabled = true;
    recordButton.disabled = true;
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
    recordButton = document.querySelector("#record-button");
    videoElement = document.getElementById("vid");
    cameraController = document.querySelector("#stop-vid");
    microphoneController = document.querySelector("#stop-aud");

    mediaDevices = navigator.mediaDevices;
    cameraController.disabled = true;
    microphoneController.disabled = true;
    recordButton.disabled = true;
    cameraController.innerText = "Video Off";
    microphoneController.innerText = "Audio Off";
    recordButton.innerText = "Stopped";

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

    addHandler(videoElement, "click", () => {
        try {
            if (vidOn) {
                turnOffVideo();
            } else {
                turnOnVideo();
            }
        } catch (ReferenceError) {
            log(`\n\n\t\t\tTurn on camera\n\n`);
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

function confMediaRecorder() {
    let chunks = [],
        isRecording = false;
    recordButton.disabled = false;

    recordButton.onclick = function () {
        if (!isRecording) {
            ({ chunks, isRecording } = startRecorder(chunks, isRecording));
        } else if (isRecording) {
            ({ chunks, isRecording } = stopRecorder(chunks, isRecording));
        }
    };
}

function stopRecorder(chunks, isRecording) {
    chunks = [];
    recordButton.innerText = "Stopped";
    mediaRecorder.stop();
    mediaRecorder = null;
    isRecording = false;
    console.log(`\n\tRecorder stopped\n`);
    return { chunks, isRecording };
}

function startRecorder(chunks, isRecording) {
    mediaRecorder = new MediaRecorder(localStream);
    chunks = [];
    recordButton.innerText = "Recording";
    mediaRecorder.start();
    isRecording = true;
    console.log(`\n\tRecorder started\n`);

    mediaRecorder.ondataavailable = function (e) {
        if (e.data.size > 0) {
            chunks.push(e.data);
            console.log(chunks);
        }
    };

    mediaRecorder.onstop = function (e) {
        console.log(`\n\tRecorder onstop fired\n`);
        blob = new Blob(chunks, { type: "video/ogv; codec=opus" });
    };

    mediaRecorder.onwarning = function (e) {
        console.log(`\n\tRecorder Onwarning fired\n\t\t${e.data}\n`);
    };

    mediaRecorder.onerror = function (e) {
        console.log(`\n\tRecorder Onerror fired\n\t\t${e.data}\n`);
    };
    return { chunks, isRecording };
}
