const RatingAndReview =require("../models/RatingAndReview");
const Course = require("../models/Course");
const mongoose = require("mongoose");

//createRating
exports.createRating =async(req,res)=>{
    try{
        //get user id
        const userId =req.user.id;
        //fetch data from req body
        const {rating, review, courseId} = req.body;

        // validate request body
        if (!courseId) {
            return res.status(400).json({ success: false, message: 'courseId is required' });
        }
        if (rating === undefined || rating === null) {
            return res.status(400).json({ success: false, message: 'rating is required' });
        }
        if (!review || String(review).trim().length === 0) {
            return res.status(400).json({ success: false, message: 'review is required' });
        }
        //check if user is enrolled or not
        const courseDetails = await Course.findOne(
                            {_id:courseId,
                               studentsEnrolled: {$elemMatch:{$eq:userId}},
                                
                            });
        if(!courseDetails){
            return res.status(400).json({
                success:false,
                message:'Student is not enrolled in the course',
            });
        }
        //check if user already reviewed in course
        const alreadyReview = await RatingAndReview.findOne({
                                user: userId,
                                course: courseId,
                            });
        // if a review already exists, disallow creating another
        if(alreadyReview){
            return res.status(403).json({
                success:false,
                message:'Course is already reviewed by the user',
            });
        }
        //create rating and review

        const ratingReview = await RatingAndReview.create({
            rating,
            review,
            course: courseId,
            user: userId,
        });
        //update course with this rating/review

        const updatedCourseDetails = await Course.findByIdAndUpdate(
            courseId, // id
            {
                $push: {
                    ratingAndReviews: ratingReview._id,
                },
            },
            { new: true }
        );
        
        console.log(updatedCourseDetails);
        // return response 
        return res.status(200).json({
            success:true,
            message:"Rating and Review created Successfully",
            ratingReview,
        })
    }
    catch(error){
        console.log(error);
        return res.status(500).json({
            success:false,
            message:error.message,
        })

    }
}
//getAverageRating

exports.getAverageRating = async (req,res)=>{
    try{
        //get course ID
        const courseId =req.body.courseId;
        //calculating
        const result = await RatingAndReview.aggregate([
            {
                $match:{
                    course:new mongoose.Types.ObjectId(courseId),//here we are converting course id  into object form
                },
            },
            {
                $group:{
                    _id:null,
                    averageRating:{$avg: "$rating"},//now we have find avg rating using avg operator
                }
            }
        ])

        //return rating
        if(result.length>0){
            return res.status(200).json({
                success:true,
                averageRating:result[0].averageRating,//result ke 0th index par averageRating key ko return kiya
            })
        }
        //if no rating/review exist
        return res.status(200).json({
            success:true,
            message:'Average Rating is 0, no rating given till now',
            averageRating:0,
        })
    }
    catch(error){
        console.log(error);
        return res.status(500).json({
            success:false,
            message:error.message,
        })
    }
}

//getAllRatingAndReviews

exports.getAllRating = async(req,res)=>{
    try{
        const AllReviews =await RatingAndReview.find({})
                            .sort({rating:"desc"})
                            .populate({
                                path:"user",
                                select:"firstName lastName email image",//there properties we will finding from path
                            })
                            .populate({
                                path:"course",
                                    select:"courseName",
                            })
                            .exec();
        return res.status(200).json({
            success:true,
            message:"All reviews fetched successfully",
            data:AllReviews,
        });
    }
    catch(error){
        console.log(error);
        return res.status(500).json({
            success:false,
            message:error.message,
        })
    }
}