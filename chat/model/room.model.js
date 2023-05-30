const mongoose=require("mongoose");
var roomSchema=new mongoose.Schema({
    roomName:String
})
mongoose.model('room',roomSchema);