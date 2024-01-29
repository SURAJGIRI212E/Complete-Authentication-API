import mongoose from "mongoose";

const userSchema =new mongoose.Schema({
    name:{type:String,require:true,trim:true},
    email:{type:String,require:true,trim:true},
    password:{type:String,require:true,trim:true},
    tc:{type:Boolean,require:true}
})

const UserModel= mongoose.model("user",userSchema)

export default UserModel