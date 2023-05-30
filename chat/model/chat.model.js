const { text } = require("express");
const mongoose=require("mongoose");
var userSchema=new mongoose.Schema({
    _id_room:{
        type:String
    },
    sender:String,
    reciver:String,
    content:String
})
mongoose.model('chat',userSchema);