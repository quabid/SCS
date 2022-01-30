let record = document.querySelector("#start");
let stop = document.querySelector("#stop");
let video = document.querySelector("#player");
video.setAttribute("controls", "");

let chunks = [];

let constraints = { video: true };

const onSuccess = function (stream) {
    console.log("stream", stream);
    let mediaRecorder = new MediaRecorder(stream);

    record.onclick = function () {
        chunks = [];
        mediaRecorder.start();
        console.log("recorder started");
    };

    stop.onclick = function () {
        mediaRecorder.stop();
        console.log("recorder stopped");
    };

    mediaRecorder.ondataavailable = function (e) {
        console.log("data available");
        chunks.push(e.data);
    };

    mediaRecorder.onstop = function (e) {
        console.log("onstop fired");
        let blob = new Blob(chunks, { type: "video/ogv; codecs=opus" });
        video.src = window.URL.createObjectURL(blob);
    };

    mediaRecorder.onwarning = function (e) {
        console.log("onwarning fired");
    };

    mediaRecorder.onerror = function (e) {
        console.log("onerror fired");
    };
};

const onError = function (err) {
    console.log("The following error occured: " + err);
};

navigator.getUserMedia(constraints, onSuccess, onError);
