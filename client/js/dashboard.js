function createMeeting(){

const room = Math.random().toString(36).substr(2,9);

window.location = "meeting.html?room="+room;

}

function joinMeeting(){

const room = document.getElementById("roomId").value;

window.location = "meeting.html?room="+room;

}