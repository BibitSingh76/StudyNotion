//import mongoose
const mongoose = require("mongoose");

//now schema
const sectionSchema = new mongoose.Schema({
      sectionName:{
        type:String,
      },
      subSection:[
            {
                type:mongoose.Schema.Types.ObjectId,
                required:true,
                ref:"SubSection",
            }
      ]
});
//now export module
module.exports = mongoose.model("Section", sectionSchema);
