//import mongoose
const mongoose = require("mongoose");

//now schema
const profileSchema = new mongoose.Schema({
        gender:{
            type:String,
        },
        dateOfBirth:{
            type:String,
        },
        about:{
            type:String,
            trim:true,
        },
        contactNumber:{
            type:Number,
            trim:true,
        }
});
//now export module
module.exports = mongoose.model("Profile",profileSchema);
