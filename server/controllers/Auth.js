const bcrypt = require("bcrypt")
const User = require("../models/User")
const OTP = require("../models/OTP")
const jwt = require("jsonwebtoken")
const otpGenerator = require("otp-generator")
const mailSender = require("../utils/mailSender")
const otpTemplate = require("../mail/templates/emailVerificationTemplate")
const { passwordUpdated } = require("../mail/templates/passwordUpdate")
const Profile = require("../models/Profile")
require("dotenv").config()

// sendOTP function
exports.sendOTP = async (req, res) => {
    try {
        const { email } = req.body;
        if (!email) {
            return res.status(400).json({ success: false, message: 'Email is required' });
        }

        // check if user already exists
        const checkUserPresent = await User.findOne({ email });
        if (checkUserPresent) {
            return res.status(401).json({ success: false, message: 'User already registered' });
        }

        // generate otp (digits only)
        let otp = otpGenerator.generate(6, {
            digits: true,
            upperCaseAlphabets: false,
            lowerCaseAlphabets: false,
            specialChars: false,
        });
        console.log('OTP generated: ', otp);

       // check unique otp or not
       let result = await OTP.findOne({ otp });

       while (result) { // ensure otp is unique
            otp = otpGenerator.generate(6, {
                digits: true,
                upperCaseAlphabets: false,
                lowerCaseAlphabets: false,
                specialChars: false,
            });
            result = await OTP.findOne({ otp });
       }
       const otpPayload = {email, otp};

       //create an entry for OTP
       console.log('Saving OTP entry for:', email);
       const otpBody = await OTP.create(otpPayload);
       console.log('OTP entry saved:', otpBody._id);

       // send otp email
       try {
           console.log('Sending OTP email to:', email);
           const mailRes = await mailSender(
               email,
               "StudyNotion - Your OTP",
               otpTemplate(otp)
           );
           console.log('OTP email sent:', mailRes && mailRes.messageId);
       } catch (mailError) {
           console.error('Failed to send OTP email:', mailError && mailError.message);
           // rollback created OTP entry if email fails
           try {
               await OTP.findByIdAndDelete(otpBody._id);
           } catch (delErr) {
               console.error('Failed to delete OTP after mail failure:', delErr && delErr.message);
           }
           return res.status(500).json({
               success: false,
               message: 'Failed to send OTP email',
               error: mailError && mailError.message ? mailError.message : String(mailError),
           });
       }
       //return response successfully
       res.status(200).json({
            success:true,
            message:'OTP Sent Successfully',
            otp,
       })
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success:false,
            message:error.message,
        })
    }
};



//signUp
exports.signUp = async(req,res) =>{
    
    try {

        // data fetch from request body / UI
        const {
            firstName,
            lastName,
            email,
            password,
            confirmPassword,
            accountType,
            contactNumber,
            otp,
        } = req.body;
    //validate 
    if(!firstName || !lastName || !email || !password || !confirmPassword
        || !otp){
            return res.status(403).json({
                success:false,
                message:"All fields are required",
            })
    }
    //match both password  

    if(password!== confirmPassword){
        return res.status(400).json({
            success:false,
            message:'Password and ConfirmPassword Value does not match, please try again',
        });
    }
    //check user already exist or not
    const existingUser = await User.findOne({email});
    if(existingUser){
        return res.status(400).json({
            success:false,
            message:'User is already registered',
        });
    }
    // find most recent OTP stored for the user
    const recentOtpArr = await OTP.find({ email }).sort({ createdAt: -1 }).limit(1);
    console.log(recentOtpArr);
    // validate OTP
    if (recentOtpArr.length === 0) {
        return res.status(400).json({ success: false, message: 'OTP not found' });
    }
    const recentOtp = recentOtpArr[0];
    if (String(otp).trim() !== String(recentOtp.otp).trim()) {
        return res.status(400).json({ success: false, message: 'Invalid OTP' });
    }
    // now Hash password

    const hashedPassword = await bcrypt.hash(password,10);
    //now entry create in DB

    const profileDetails = await Profile.create({
        gender: null,
        dateOfBirth: null,
        about: null,
        contactNumber: contactNumber || null,
    });

    const user = await User.create({
        firstName,
        lastName,
        email,
        contactNumber,
        password: hashedPassword,
        accountType,
        additionalDetails: profileDetails._id, // profileDetails structure is above
        image: `https://api.dicebear.com/5.x/initials/svg?seed=${firstName}%20${lastName}`,
    });

    // return response
    return res.status(200).json({ success: true, message: 'User is registered Successfully', user });
    } catch (error) {
        console.error('Signup error:', error);
        // log full stack and request body for easier debugging
        console.error('Signup error stack:', error.stack);
        try {
            console.error('Signup request body:', req.body);
        } catch (e) {
            console.error('Failed to log request body:', e && e.message);
        }
        return res.status(500).json({ success: false, message: error.message || 'User cannot be registered. Please try again' });
    }
};



//Login

exports.login = async(req,res) =>{
    try{
        //get data from req body
        const {email,password} = req.body;
       // validation data
       if(!email || !password){
            return res.status(403).json({
                success:false,
                message:'All fields are required, please try again',
            });
       }
       
       // user check exist or not
       
    const user = await User.findOne({email}).populate("additionalDetails");//we are finding email in User
       if(!user){
            return res.status(401).json({
                success:false,
                message:"User is not registered, please signup first",
            });
       }
       //generate JWT, after password matching
      
       if(await bcrypt.compare(password,user.password)){
            const payload ={
                email: user.email,
                id: user._id,
                accountType: user.accountType,
            }

            if (!process.env.JWT_SECRET) {
                return res.status(500).json({ success: false, message: 'Server misconfiguration: JWT_SECRET is not set' });
            }

            const token = jwt.sign(payload, process.env.JWT_SECRET, {
                expiresIn: "2h",
            });
            user.token = token;
            user.password = undefined;
        //create cookie and send response
        const options ={
            expires: new Date(Date.now() + 3*24*60*60*1000),//cookie will expire in 3 days
            httpOnly:true,
        }
        res.cookie("token",token,options).status(200).json({
            success:true,
            token,
            user,
            message:'Logged in successfully',
        })

       }
       else{
            return res.status(401).json({
                success:false,
                message:'Password is incorrect',
            })
       }
    }
    catch(error){
        console.log(error);
        return res.status(500).json({
            success:false,
            message:'Login Failure , please try again',
        });
    }
}

//changePassword
//TODO: HOMEWORK
// exports.changePassword =async(req,res)=>{
//     //get data from req body
//     //get oldPassword, newPassword , confirmPassword

//     //validation

//     //update pwd in DB
//     //send mail - password updated
//     //return response
// }

exports.changePassword = async (req, res) => {
  try {
    // Get user data from req.user
    const userDetails = await User.findById(req.user.id)

    // Get old password, new password, and confirm new password from req.body
    const { oldPassword, newPassword } = req.body

    // Validate old password
    const isPasswordMatch = await bcrypt.compare(
      oldPassword,
      userDetails.password
    )
    if (!isPasswordMatch) {
      // If old password does not match, return a 401 (Unauthorized) error
      return res
        .status(401)
        .json({ success: false, message: "The password is incorrect" })
    }

    // Update password
    const encryptedPassword = await bcrypt.hash(newPassword, 10)
    const updatedUserDetails = await User.findByIdAndUpdate(
      req.user.id,
      { password: encryptedPassword },
      { new: true }
    )

    // Send notification email
    try {
      const emailResponse = await mailSender(
        updatedUserDetails.email,
        "Password for your account has been updated",
        passwordUpdated(
          updatedUserDetails.email,
          `Password updated successfully for ${updatedUserDetails.firstName} ${updatedUserDetails.lastName}`
        )
      )
      console.log("Email sent successfully:", emailResponse.response)
    } catch (error) {
      // If there's an error sending the email, log the error and return a 500 (Internal Server Error) error
      console.error("Error occurred while sending email:", error)
      return res.status(500).json({
        success: false,
        message: "Error occurred while sending email",
        error: error.message,
      })
    }

    // Return success response
    return res
      .status(200)
      .json({ success: true, message: "Password updated successfully" })
  } catch (error) {
    // If there's an error updating the password, log the error and return a 500 (Internal Server Error) error
    console.error("Error occurred while updating password:", error)
    return res.status(500).json({
      success: false,
      message: "Error occurred while updating password",
      error: error.message,
    })
  }
}
