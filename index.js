let video = document.querySelector("video");
let recordBtnCont = document.querySelector(".record-btn-cont");
let recordBtn = document.querySelector(".record-btn");
let captureBtnCont = document.querySelector(".capture-btn-cont");
let captureBtn = document.querySelector(".capture-btn");
let transparentColor = "transparent";

let recordFlag = false;

let recorder;
let chunks = [];

let constraints = {
    audio: false,
    video: true,
};

// Create a canvas element for processing video frames
let canvas = document.createElement('canvas');
let ctx = canvas.getContext('2d');

navigator.mediaDevices.getUserMedia(constraints)
.then((stream) => {
    video.srcObject = stream;
    video.onloadedmetadata = () => {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
    };

    // Create a new MediaStream from the canvas
    let canvasStream = canvas.captureStream();

    recorder = new MediaRecorder(canvasStream);
    recorder.addEventListener("start", (e) => {
        chunks = [];
    });
    recorder.addEventListener("dataavailable", (e) => {
        chunks.push(e.data);
    });
    recorder.addEventListener("stop", (e) => {
        let blob = new Blob(chunks, { type: "video/mp4" });
        let videoURL = URL.createObjectURL(blob);
        let a = document.createElement('a');
        a.href = videoURL;
        a.download = "filtered_stream.mp4";
        a.click();
    });

    recordBtnCont.addEventListener("click", (e) => {
        if (!recorder) return;

        recordFlag = !recordFlag;
        if (recordFlag) {
            recorder.start();
            recordBtn.classList.add("scale-record");
            startTimer();
            requestAnimationFrame(drawVideoFrame);
        } else {
            recorder.stop();
            recordBtn.classList.remove("scale-record");
            stopTimer();
        }
    });
});

function drawVideoFrame() {
    if (recordFlag) {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        
        // Apply filter
        ctx.fillStyle = transparentColor;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        requestAnimationFrame(drawVideoFrame);
    }
}

captureBtnCont.addEventListener("click", (e) => {
    captureBtnCont.classList.add("scale-capture");

    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    
    // Apply filter to captured image
    ctx.fillStyle = transparentColor;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    let imageURL = canvas.toDataURL("image/jpeg");

    let a = document.createElement('a');
    a.href = imageURL;
    a.download = "filtered_image.jpeg";
    a.click();

    setTimeout(() => {
        captureBtnCont.classList.remove("scale-capture");
    }, 500);
});

// Filtering logic
let filter = document.querySelector(".filter-layer");

let allFilter = document.querySelectorAll(".filter");
allFilter.forEach((filterElem) => {
    filterElem.addEventListener("click", (e) => {
        transparentColor = getComputedStyle(filterElem).getPropertyValue("background-color");
        filter.style.backgroundColor = transparentColor;
    });
});

// Timer code remains the same
let timerID;
let counter = 0;// Represents total seconds
let timer = document.querySelector(".timer");
function startTimer(){
    timer.style.display = "block";
    function displayTimer(){
        /*
            How to caluculate the time is that
            1) Initialize a variable that actually stores no.of seconds
            2) when ever this function displayTimer is called then we need to increment the
             counter variable , as each call of this function is considered as
             1sec in regular time. Why? because we need to get the actual time when
             this thing needs counted.
            How to count Hours, Minutes & Seconds?
            counter = 3725
            we know 1hr = 3600 seconds ,
            to count 1hr using counter value, we use '/(division operator)' btw 
            counter and 3600 sec. division operator is used to perform floor divison
            3725/3600 = >1
            remainder 3725%3600 =>no.of minutes in seconds , so we need to convert back
            to minutes, 1minute = 60seconds
        
        */
       let totalSeconds = counter;
       let hours = Number.parseInt(totalSeconds / 3600);
       totalSeconds = totalSeconds % 3600;
        let minutes = Number.parseInt(totalSeconds / 60);
        totalSeconds= totalSeconds % 60;
        let seconds = totalSeconds;

        hours = (hours < 10) ? `0${hours}`:hours;
        minutes = (minutes < 10) ? `0${minutes}` : minutes;
        seconds = (seconds < 10) ? `0${seconds}` : seconds;

        timer.innerText = `${hours}:${minutes}:${seconds}`;
       
        counter++;
    }
    timerID= setInterval(displayTimer,1000);//we are calling this function displayTimer()
}
function stopTimer(){
    clearInterval(timerID);
    timer.innerText = "00:00:00";
    timer.style.display="none";
}
