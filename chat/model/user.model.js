const mongoose=require("mongoose");
var userSchema=new mongoose.Schema({
    userName:String
})
mongoose.model('user',userSchema);