//import mongoose
const mongoose = require("mongoose");

//now schema
const ratingAndReview= new mongoose.Schema({
      user:{
        type:mongoose.Schema.Types.ObjectId,
        required:true,
        ref:"User",
      },
      course: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: "Course",
      },
      rating:{
        type:Number,
        required:true
      },
      review:{
        type:String,
        required:true,
      }
});
//now export module
module.exports = mongoose.model("RatingAndReview",ratingAndReview);
