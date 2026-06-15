const User =require("../models/User");
const mailSender =require("../utils/mailSender");
const bcrypt =require("bcrypt");
const crypto = require('crypto');
//resetPasswordToken
exports.resetPasswordToken = async(req,res)=>{
    try{
        //get email from req body
        if (!req.body || !req.body.email) {
            return res.status(400).json({ success: false, message: 'Email is required' });
        }
        const email = req.body.email;
    //check user for this email ,email validation
    const user =await User.findOne({email: email});
    if(!user){
        return res.json({success:false,
            message:'Your Email is not registered' });
    }

    //generate token 
    const token = crypto.randomUUID();
    //update user by adding token adn expiration time
    const updatedDetails =await User.findOneAndUpdate({email:email},
        {//ye values update hongi
            token:token,
            resetPasswordExpires:Date.now() +5*60*1000,
        },
        {new:true});
    // create url using CLIENT_URLS env (first entry) to avoid hardcoded http
    const clientUrls = process.env.CLIENT_URLS || ''
    const frontendBase = clientUrls.split(',')[0] || 'http://localhost:3000'
    const url = `${frontendBase.replace(/\/$/, '')}/update-password/${token}`
    //send mail containing the url

    //send mail containing the url
    await mailSender(email,
        "Password Reset Link",
        `Password Reset Link: ${url}`);
    //return response
    return res.json({
        success:true,
        message:'Email sent successfully , please check email and change pwd',
    });
    } catch(error){
        console.error('resetPasswordToken error:', error && error.stack ? error.stack : error);
        return res.status(500).json({
            success:false,
            message:'Something went wrong while sending reset pwd mail',
            error: error && error.message ? error.message : String(error),
        });
    }
}


//resetPassword



exports.resetPassword = async (req, res) =>{
    try{
            //data fetch
        const {password , confirmPassword,token} =req.body;
        //validation
        if(password !== confirmPassword){
            return res.json({
                success:false,
                message:'Password not matching',
            });
        }
        //token ke through password update karenge
        const userDetails = await User.findOne({token: token});
        //if not entry - invalid token
        if(!userDetails){
            return res.json({
                success:false,
                messae:"Token is invalid",
            });
        }
        //token time check
        if(userDetails.resetPasswordExpires < Date.now()){//toke expire at given time
            return res.json({
                success:false,
                message:'Token is expired, please regenerate your token',
            });
        }
        //now hash password
        const hashedPassword = await bcrypt.hash(password,10);
        //update password
        await User.findOneAndUpdate(
            {token:token},
            {password:hashedPassword},
            {new:true},
        )
        //return response
        return res.status(200).json({
            success:true,
            message:'Password reste successful',
        });
    } catch(error){
        console.error('resetPassword error:', error && error.stack ? error.stack : error);
        return res.status(500).json({
            success:false,
            message:'Something went wrong while processing reset password',
            error: error && error.message ? error.message : String(error),
        });
    }
}