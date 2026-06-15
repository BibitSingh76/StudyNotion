//import mongoose
const mongoose = require("mongoose");

//now schema
const courseSchema = new mongoose.Schema({
       courseName:{
           type:String,
       },
       courseDescription:{
            type:String,
       },
       instructor:{
            type:mongoose.Schema.Types.ObjectId,
            ref:"User",
            required:true,
       },
       whatYouWillLearn:{
            type:String,
       },
       courseContent:[
        {
            type:mongoose.Schema.ObjectId,
            ref:"Section",
        }
       ],
       ratingAndReviews:[
            {
                type:mongoose.Types.ObjectId,
                ref:"RatingAndReview",
            }
       ],
       price:{
            type:Number,
       },
       thumbnail:{
        type:String,
       },
       tag:{
            type: mongoose.Schema.Types.ObjectId,
            ref:"Tag",
       },
       category:{
          type: mongoose.Schema.Types.ObjectId,
          ref:"Category",
       },
       studentsEnrolled:[
            {
                type:mongoose.Schema.Types.ObjectId,
                required:true,
                ref:"User",
            },
       ],
       instructions:{
          type:[String],
       },
       status:{
          type:String,
          enum:["Draft","Published"],
       },
});
//now export module
module.exports = mongoose.model("Course",courseSchema);
