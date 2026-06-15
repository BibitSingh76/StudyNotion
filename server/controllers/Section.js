const Section =require("../models/Section");
const Course =require("../models/Course");

exports.createSection =async(req,res)=>{
    try{
        //data fetch
        const {sectionName,courseId} =req.body;
        //data validation
        if(!sectionName || !courseId){//if anything is empty
            return res.status(400).json({
                success:false,
                message: 'Missing Properties',
            });
        }
        //create section
        const newSection = await Section.create({sectionName});
        //update course with section ObjectID
        // push the new section id and return the updated course with populated sections and sub-sections
        const updatedCourseDetails = await Course.findByIdAndUpdate(
            courseId,
            {
                $push:{
                    courseContent:newSection._id
                }
            },
            {new:true}
        )
            .populate({ path: 'courseContent', populate: { path: 'subSection' } })
            .exec();

        //HW: use populate to replace sections/sub-sections both in the updatedCourseDetails
        //return response
        return res.status(200).json({
            success:true,
            message:'Section created successfully',
            updatedCourseDetails,
        })
    }
    catch(error){
        return res.status(500).json({
            success:false,
            message:"Unable to create Section , please try again",
            error:error.message,
        });
    }
}

exports.updateSection =async (req,res)=>{
    try{
        //data input
        const {sectionName, sectionId}=req.body;//these data comming from req body
        //data validation
        if(!sectionName || !sectionId){//if anything is empty
            return res.status(400).json({
                success:false,
                message: 'Missing Properties',
            });
        }
        //update data
        const section =await Section.findByIdAndUpdate(sectionId,{sectionName},{new:true});

        // find the course containing this section and return updated course details
        const updatedCourseDetails = await Course.findOne({ courseContent: section._id })
            .populate({ path: 'courseContent', populate: { path: 'subSection' } })
            .exec();

        return res.status(200).json({
            success: true,
            message: 'Section Updated Successfully',
            data: updatedCourseDetails,
        });
    }
    catch(error){
        return res.status(500).json({
            success:false,
            message:"Unable to create Section , please try again",
            error:error.message,
        });
    }
};

//now delete section
exports.deleteSection =async (req,res)=>{
    try{
        //get ID-assuming that we are sending ID in params
        const {sectionId} = req.body;
        // remove the section reference from any course that contains it
        const updatedCourseDetails = await Course.findOneAndUpdate(
            { courseContent: sectionId },
            { $pull: { courseContent: sectionId } },
            { new: true }
        )
            .populate({ path: 'courseContent', populate: { path: 'subSection' } })
            .exec();

        // delete the section document itself
        await Section.findByIdAndDelete(sectionId);

        return res.status(200).json({
            success: true,
            message: "Section Deleted Successfully",
            data: updatedCourseDetails,
        })
    }
    catch(error){
        return res.status(500).json({
            success:false,
            message:"Unable to delete Section, please try again",
            error:error.message,
        });
    }
}

