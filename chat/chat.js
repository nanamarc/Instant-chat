

var bouton=document.getElementById("join");
var uname=document.getElementById("name");
var join=document.getElementById("login");
var messageContainer=document.getElementById("app");
var input=document.getElementById("txt")
var form=document.getElementById("form")
const socket=io();
var roomName=document.getElementById("room_name")
let use;
let mess;
let leave=document.getElementById("leave")
bouton.addEventListener("click",function(){
  let user={
    username:uname.value,
    room:roomName.value
  }
  if(user.username=="")
  return;
  socket.emit("login",user);
  join.style.display='none';
  messageContainer.style.display='block';
  renderMessage("updateOfMine",user.room)
use=user.username;


})

input.addEventListener("focus",function(){
   socket.emit("typing",use)

    
   
})
input.addEventListener("blur",function(){
    socket.emit("stopTyping")
})

form.addEventListener("submit",function(event){
    
    event.preventDefault();
    mess=input.value;
if(mess){
  
   renderMessage("mine",{
    name:use,
    text:mess
})
socket.emit("chat",{
    name:use,
    text:mess
})
    input.value=''
}



})
function renderMessage(type,msg){
    let containeMessage=document.getElementById("message_container")
    if(type=="mine"){
        let el=document.createElement("div");
        el.setAttribute("class","my_message msg")
        el.innerHTML=`
        <div class="sender_name">you</div>
        <div class="sending">${msg.text}</div>
        `
        containeMessage.appendChild(el);
    }
    else if(type=="other"){
        let el=document.createElement("div");
        el.setAttribute("class","other_message msg")
        el.innerHTML=`
        <div class="sender_name">${msg.name}</div>
        <div class="sending">${msg.text}</div>
        `
        containeMessage.appendChild(el);
    }
    else if(type=="update"){
        let el=document.createElement("div");
        el.setAttribute("id","update")
        el.innerText=msg;
        containeMessage.appendChild(el);
    }
    else if(type=="updateOfMine"){
        const today=new Date;
        let el=document.createElement("div");
        el.setAttribute("id","update")
        el.innerText=`you have joined the room ${msg} at ${today.getHours()}h:${today.getMinutes()}min`;
        containeMessage.appendChild(el);
    }

    else if(type=="leave"){
        let el=document.createElement("div");
        el.setAttribute("id","update")
        el.innerText=msg;
        containeMessage.appendChild(el);
    }
    else if(type=="typing"){
        let el=document.createElement("div");
        el.setAttribute("class","other_message msg type")
        el.innerText=msg
        containeMessage.appendChild(el);
    }
  containeMessage.scrollTop=containeMessage.scrollHeight//-messageContainer.clientHeight;
}
leave.addEventListener("click",function(){
    socket.emit("leave",use)
    location.href="index.html"
})
socket.on("update",function(update){
    renderMessage("update",update);
})
socket.on("typing",function(message){
    renderMessage("typing",message)
})
socket.on("stopTyping",function(){
let a=document.querySelector(".type");
a.remove();
})
socket.on("chat",function(message){
    renderMessage("other",message);
})


socket.on("leave",function(urname){
    renderMessage("leave",urname)
})



// emoji



