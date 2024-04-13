import jwt from 'jsonwebtoken';
import userModel from '../model/user.model.js';
const isAuthenticatedUser = async (req,res,next)=>{
    try {
        const {jwtToken} = req.cookies;
        if(!jwtToken){
            return res.status(401).json({message : "You are not authenticated parson, please login first"});
        };
        const decodedData = jwt.verify(jwtToken, process.env.JWT_SECRET);
        req.user = await userModel.findById(decodedData.userId);
        next();
    }catch (error) {
        console.log(error.message);
        res.status(500).json({message : "Internal server error"})
    };
};

const isAdmin = async (req,res,next)=>{
    if(req.user.isAdmin !== 1){
        return res.status(403).json({message : "you are not admin"});
    }else{
        next();
    }
};

export {isAuthenticatedUser, isAdmin};