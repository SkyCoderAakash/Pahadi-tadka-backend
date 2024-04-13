import mongoose from "mongoose";

const userSchema = mongoose.Schema({
    name : {
        required:true,
        type:String,
        lowercase : true,
    },
    email : {
        required:true,
        type:String,
        lowercase : true,
    },
    password : {
        required:true,
        type:String,
        select : false
    },
    isVarified : {
        default : 0,
        type:Number,
    },
    isAdmin : {
        default : 0,
        type:Number,
    },
    verificationCode : {
        otp : { type : String },
        timeStamp : {},
    },
},{timestamps : true});

const userModel = mongoose.model('User',userSchema);
export default userModel;