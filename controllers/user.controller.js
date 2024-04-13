import userModel from "../model/user.model.js";
import bcrypt from 'bcrypt';
import generateToken from "../utils/createToken.js";
import mailSender from "../utils/sendingEmail.js";

// only access by user for createing account
const createUser = async (req, res) => {
    const { name, email, password } = req.body;
    // console.log(req.body);
    try {
        if(!name || !email || !password){
            return res.status(400).json({ message: 'Fill the data proper' });
        }
        const existingUser = await userModel.findOne({ email: email.toLowerCase() });
        if (existingUser) {
            return res.status(400).json({ message: 'Email is already in use' });
        };
        const OTP = Math.floor(100000 + Math.random() * 900000);
        const hashOTP = await bcrypt.hash(OTP.toString(), 10);
        const text = `your verification code is ${OTP} and this code is valid for 10 min only. Don't share this OTP with anyone, It may cause Danger.`;
        const hashPassword  = await bcrypt.hash(password, 10);

        // console.log(OTP);
        // console.log(hashOTP)

        const user = userModel({
            name : name.toLowerCase(),
            email : email.toLowerCase(),
            password : hashPassword,
            verificationCode : {
                otp : hashOTP,
                timeStamp : Date.now(),
            },
        });
        await mailSender(email,text);
        const newUser = await user.save();
        return res.status(201).json({ message: 'User created successfully', data : {
            name : newUser.name,
            email : newUser.email,
            path : `http://localhost:${process.env.PORT}/api/otpverification/${newUser._id}`
        }});
    } catch (error) {
        console.error('Error creating user:', error);
        return res.status(500).json({ message: 'Internal server error' });
    }
};
// only access by admin to show all users
const getAllUser = async (req,res) => {
    try {
        const users = await userModel.find().select('-verificationCode -password -isAdmin -updatedAt');
        return res.status(200).json({data : users});
    } catch (error) {
        console.error('Error creating user:', error);
        return res.status(500).json({ message: 'Internal server error' });
    }
}
// only access by admin to show a perticular user
const getUserById = async (req,res) => {
    try {
        const {id} = req?.params;
        const user = await userModel.findById(id);
        if(user){
            res.status(200).json({ message : "user get successfully" ,data : user});
        }else{
            res.status(404).json({message : "user not found"});
        };
    } catch (error) {
        if(error.name==="CastError") return res.status(404).json({ message: "User not found" });
        console.error('Error getting a single user:', error);
        return res.status(500).json({ message: 'Internal server error in getting single user by id' });   
    }
}

const verifyOTP = async (req, res) => {
    const { otp } = req.body;
    const { id } = req.params;
    try {
        const user = await userModel.findOne({ '_id': id });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        };
        if(Date.now() - user.verificationCode.timeStamp < process.env.OTP_EXPIRES_IN * 60 * 1000){
            const isOTPMatched = await bcrypt.compare(otp, user.verificationCode.otp);
            if (isOTPMatched) {

                const token = generateToken(user._id, user.role);
                res.cookie('jwtToken', token, {
                    httpOnly: true, // Prevents client-side JavaScript from accessing the cookie
                    secure: true, // Ensures the cookie is only sent over HTTPS
                    maxAge: process.env.COOKIE_EXPIRE * 24 * 60 * 60 * 1000, // Expiration time in milliseconds (7 days)
                    sameSite: 'strict' // Restricts the cookie to be sent only to the same site as the request
                });
                user.isVarified = 1;
                user.verificationCode = {};
                const newUser = await user.save();
                if (newUser) {
                    return res.status(201).json({ message: 'User created successfully', data : {
                        name : newUser.name,
                        email : newUser.email,
                    }, token });
                    // return res.status(200).json({ message: 'OTP verified successfully ', data: newUser });
                };
            }else {
                res.status(401).json({ message: 'Invalid OTP' });
            };
        }else{
            res.status(408).json({ message: 'Request time out please resend the OTP' });
        };
    } catch (error) {
        if(error.name==="CastError") return res.status(404).json({ message: "User not found" });
        console.error('Error verifying OTP:', error);
        return res.status(500).json({ message: 'Internal server error' });
    }
};

const userByEmail = async (req,res) =>{
    try {
        const {email} = req?.body;
        const user = await userModel.findOne({email : email});
        if(user){
            const OTP = Math.floor(100000 + Math.random() * 900000);
            const hashOTP = await bcrypt.hash(OTP.toString(),10);
            const text = `your verification code is ${OTP} and this code is valid for 10 min only. Don't share this OTP with anyone, It may cause Danger.`;
            mailSender(email,text);
            user.verificationCode = {
                otp : hashOTP,
                timeStamp : Date.now(),
            },
            await user.save();
            return res.status(200).json({ message : "user get successfully" ,data : user});
        }else{
            res.status(404).json({message : "user not found"});
        }
    } catch (error) {
        return res.status(500).json({ message: 'Internal server error' });
    }
}

const resetPassword = async (req,res)=>{
    try {
        const {id} = req.params;
        const { newPassword } = req.body;
        const newHashPassword = await bcrypt.hash(newPassword,10);
        const updatePassword = await userModel.findByIdAndUpdate(id, { password : newHashPassword }, { new: true });
        if (!updatePassword) {
            return res.status(404).json({ message: 'User not found' });
        };
        const token = generateToken(updatePassword._id, updatePassword.role);
        res.cookie('jwtToken', token, {
            httpOnly: true, // Prevents client-side JavaScript from accessing the cookie
            secure: true, // Ensures the cookie is only sent over HTTPS
            maxAge: process.env.COOKIE_EXPIRE * 24 * 60 * 60 * 1000, // Expiration time in milliseconds (7 days)
            sameSite: 'strict' // Restricts the cookie to be sent only to the same site as the request
        });
        return res.status(200).json({ message: 'Password updated successfully',data : {
            name : updatePassword.name,
            email : updatePassword.email,
        }, token });
    } catch (error) {
        if(error.name==="CastError") return res.status(404).json({ message: "User not found" });
        console.error('update password:', error);
        return res.status(500).json({ message: 'Internal server error' });
    }
    
};

const userLogin = async (req,res)=>{
    try {
        const {email,password} = req.body;
        if(!email || !password){
            return res.status(400).json({ message: 'Fill the data proper' });
        }
        const userCheck = await userModel.findOne({email : email}).select('+password');
        if(userCheck){
            const passwordCheck = await bcrypt.compare(password,userCheck.password);
            if(passwordCheck){
                if(userCheck.isVarified === 1){
                    const token = generateToken(userCheck._id, userCheck.role);
                    res.cookie('jwtToken', token, {
                        httpOnly: true, // Prevents client-side JavaScript from accessing the cookie
                        secure: true, // Ensures the cookie is only sent over HTTPS
                        maxAge: process.env.COOKIE_EXPIRE * 24 * 60 * 60 * 1000, // Expiration time in milliseconds (7 days)
                        sameSite: 'strict' // Restricts the cookie to be sent only to the same site as the request
                    });
                    return res.status(201).json({ message: 'User login successfully',data : {
                        name : userCheck.name,
                        email : userCheck.email
                    }, token });
                }else{
                    if(userCheck.verificationCode.timeStamp===undefined){
                        const OTP = Math.floor(100000 + Math.random() * 900000);
                        const text = `your verification code is ${OTP} and this code is valid for 10 min only. Don't share this OTP with anyone, It may cause Danger.`;
                        mailSender(email,text);
                        userCheck.verificationCode = {
                            otp : OTP,
                            timeStamp : Date.now(),
                        };
                        const data = await userCheck.save();
                        if(data) {
                            res.status(202).json({message : "email send to your mail",data : userCheck});
                        }
                    }else if(userCheck.verificationCode.timeStamp!==undefined && Date.now() - userCheck.verificationCode.timeStamp < process.env.OTP_EXPIRES_IN *60*1000){
                        res.status(202).json({message : "email already to your mail"});
                    }else if(userCheck.verificationCode.timeStamp!==undefined && Date.now() - userCheck.verificationCode.timeStamp > process.env.OTP_EXPIRES_IN *60*1000){
                        const OTP = Math.floor(100000 + Math.random() * 900000);
                        const text = `your verification code is ${OTP} and this code is valid for 10 min only. Don't share this OTP with anyone, It may cause Danger.`;
                        mailSender(email,text);
                        userCheck.verificationCode = {
                            otp : OTP,
                            timeStamp : Date.now(),
                        };
                        const data = await userCheck.save();
                        if(data) {
                            res.status(202).json({message : "email send to your mail",data : userCheck});
                        };
                    };
                };
            }else{
                res.status(400).json({ message: 'invalid data'});
            };
        }else{
            res.status(400).json({ message: 'invalid data' });
        };
    } catch (error) {
        console.log(error.message);
        res.status(500).json({message : "internal server error in loginController"});
    };
};

const userLogout = async (req,res)=>{
    res.cookie('jwtToken', null, {
        httpOnly: true, // Prevents client-side JavaScript from accessing the cookie
        secure: true, // Ensures the cookie is only sent over HTTPS
        expires: new Date(0), // Set expiration date to a past date
        sameSite: 'strict' // Restricts the cookie to be sent only to the same site as the request
    });
    res.status(200).json({ message : "User logout" });
};


export {createUser, getAllUser, getUserById, verifyOTP, userByEmail, resetPassword, userLogin, userLogout};