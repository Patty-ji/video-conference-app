const input = document.getElementById("chat_message");
const messages = document.getElementById("messages");

function sendMessage(){

const msg = input.value;

socket.emit("message", msg);

input.value="";

}

socket.on("createMessage", msg => {

const li=document.createElement("li");
li.innerText=msg;

messages.append(li);

});