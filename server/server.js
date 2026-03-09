const express = require("express");
const http = require("http");
const {Server} = require("socket.io");
const {v4: uuidv4} = require("uuid");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static("client"));

app.get("/create",(req,res)=>{
res.redirect(`/meeting.html?room=${uuidv4()}`);
});

io.on("connection",(socket)=>{

socket.on("join-room",(roomId,userId)=>{

socket.join(roomId);

socket.to(roomId).emit("user-connected",userId);

socket.on("message",(msg)=>{
io.to(roomId).emit("createMessage",msg);
});

socket.on("raise-hand",()=>{
io.to(roomId).emit("user-raised-hand",userId);
});

socket.on("reaction",(emoji)=>{
io.to(roomId).emit("reaction",emoji);
});

socket.on("file-share",(file)=>{
io.to(roomId).emit("file-share",file);
});

socket.on("disconnect",()=>{
socket.to(roomId).emit("user-disconnected",userId);
});

});

});

const authRoutes = require("./routes/auth");

app.use("/api/auth",authRoutes);

server.listen(3000,()=>{
console.log("Server running on http://localhost:3000");
});