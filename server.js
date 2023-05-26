const { log, error } = require("console");
const express=require("express");
const path=require("path");
const { Socket } = require("socket.io");
const app=express();
const server=require("http").createServer(app);
const io=require("socket.io")(server);
const { Pool }=require("pg");

const pool=new Pool({
    user: 'postgres',
    host: 'localhost',
    database: 'chat',
    password: 'motdepasse',
    port: 5432, // Port par défaut de PostgreSQL
  });

pool.query(`select * from room`,(error,result)=>{
    if(error)
    console.log('erreur d execution lors de la requte',error)
    else
    console.log("le table room:",result.rows);
})
app.use(express.static(path.join(__dirname, 'chat')));
let globalRoom="global"
io.on("connection",function(socket){


let currentRoom;
socket.on("login",function(data){
    let username=data.username
    let  room=data.room 
    if(room=="")
        currentRoom=globalRoom
    else
    currentRoom=room;
   
    socket.join(currentRoom)
 
    console.log(username+" is connected to the room "+currentRoom)
    socket.broadcast.to(currentRoom).emit("update",username+ " has joined room "+currentRoom)
})
socket.on("typing",function(data){
  
    socket.broadcast.to(currentRoom).emit("typing",data+" est en train d'ecrire...")
})
socket.on("stopTyping",function(){
    socket.broadcast.to(currentRoom).emit("stopTyping")
})
socket.on("chat",function(message){
    socket.broadcast.to(currentRoom).emit("chat",message);

  

socket.on("leave",function(username){
    socket.leave(currentRoom)
    socket.broadcast.to(currentRoom).emit("leave",username+" has left the conversation")
   
})

    
})



})
server.listen(819,()=>{
    console.log("listen to port 605")
    
});
