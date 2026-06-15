//import mongoose
const mongoose = require("mongoose");

//now schema
const subSectionSchema = new mongoose.Schema({
       title:{
        type:String,
       },
       timeDuration:{
        type:String,
       },
       description:{
              type:String,
       },
       videoUrl:{
        type:String,
       },
});
//now export module
module.exports = mongoose.models.SubSection || mongoose.model("SubSection", subSectionSchema);
