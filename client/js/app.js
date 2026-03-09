const socket = io();

const urlParams = new URLSearchParams(window.location.search);
const ROOM_ID = urlParams.get("room");

const videoGrid = document.getElementById("video-grid");

const myVideo = document.createElement("video");
myVideo.muted = true;

let myStream;
let peer;

// ------------------ MEETING TIMER ------------------

let seconds = 0;

setInterval(() => {

seconds++;

let min = Math.floor(seconds / 60);
let sec = seconds % 60;

document.getElementById("meetingTimer").innerText =
`${min}:${sec < 10 ? "0"+sec : sec}`;

},1000);


// ------------------ START CAMERA ------------------

navigator.mediaDevices.getUserMedia({
video:true,
audio:true
})
.then(stream => {

console.log("Camera started successfully");

myStream = stream;

addVideoStream(myVideo, stream);

// Start Peer AFTER camera works
peer = new Peer();

peer.on("open", id => {

socket.emit("join-room", ROOM_ID, id);

});

// Answer incoming calls
peer.on("call", call => {

call.answer(stream);

const video = document.createElement("video");

call.on("stream", userVideoStream => {

addVideoStream(video, userVideoStream);

});

});

// When new user joins
socket.on("user-connected", userId => {

connectToNewUser(userId, stream);

});

})
.catch(error => {

console.error("Camera error:", error);

alert("Camera or microphone permission denied");

});


// ------------------ ADD VIDEO ------------------

function addVideoStream(video, stream){

video.srcObject = stream;

video.addEventListener("loadedmetadata", () => {

video.play();

});

videoGrid.append(video);

}


// ------------------ CONNECT NEW USER ------------------

function connectToNewUser(userId, stream){

const call = peer.call(userId, stream);

const video = document.createElement("video");

call.on("stream", userVideoStream => {

addVideoStream(video, userVideoStream);

});

}


// ------------------ MIC CONTROL ------------------

function toggleMic(){

const enabled = myStream.getAudioTracks()[0].enabled;

myStream.getAudioTracks()[0].enabled = !enabled;

}


// ------------------ CAMERA CONTROL ------------------

function toggleCamera(){

const enabled = myStream.getVideoTracks()[0].enabled;

myStream.getVideoTracks()[0].enabled = !enabled;

}


// ------------------ SCREEN SHARE ------------------

async function shareScreen(){

const screenStream =
await navigator.mediaDevices.getDisplayMedia({video:true});

addVideoStream(document.createElement("video"),screenStream);

}


// ------------------ CHAT ------------------

function sendMessage(){

const input = document.getElementById("chat_message");

socket.emit("message", input.value);

input.value = "";

}

socket.on("createMessage", msg => {

const li = document.createElement("li");

li.innerText = msg;

document.getElementById("messages").append(li);

});


// ------------------ PARTICIPANTS ------------------

socket.on("user-connected", id => {

const li = document.createElement("li");

li.innerText = id;

document.getElementById("participantsList").append(li);

});


// ------------------ RAISE HAND ------------------

function raiseHand(){

socket.emit("raise-hand");

}

socket.on("user-raised-hand", id => {

alert(id + " raised hand");

});


// ------------------ EMOJI REACTIONS ------------------

function sendReaction(emoji){

socket.emit("reaction", emoji);

}

socket.on("reaction", emoji => {

const div = document.createElement("div");

div.innerText = emoji;

document.body.append(div);

});


// ------------------ RECORDING ------------------

let recorder;
let chunks = [];

function startRecording(){

recorder = new MediaRecorder(myStream);

recorder.ondataavailable = e => {

chunks.push(e.data);

};

recorder.start();

}

function stopRecording(){

recorder.stop();

const blob = new Blob(chunks);

const url = URL.createObjectURL(blob);

const a = document.createElement("a");

a.href = url;
a.download = "meeting.webm";

a.click();

}


// ------------------ FILE SHARING ------------------

function sendFile(){

const file = document.getElementById("fileInput").files[0];

socket.emit("file-share", file.name);

}

socket.on("file-share", file => {

alert("File shared: " + file);

});