const { instance } = require("../config/razorpay")
const Course = require("../models/Course")
const crypto = require("crypto")
const User = require("../models/User")
const mailSender = require("../utils/mailSender")
const mongoose = require("mongoose")
const {
  courseEnrollmentEmail,
} = require("../mail/templates/courseEnrollmentEmail")
const { paymentSuccessEmail } = require("../mail/templates/paymentSuccessEmail")
const CourseProgress = require("../models/CourseProgress")

// Capture the payment and initiate the Razorpay order
exports.capturePayment = async (req, res) => {
  // Accept either { courses: [...] } or { course_id: "..." }
  let courses = []
  if (Array.isArray(req.body.courses)) {
    courses = req.body.courses
  } else if (req.body.course_id) {
    // support single course id payloads from frontend
    courses = [req.body.course_id]
  }

  const userId = req.user.id
  if (!courses || courses.length === 0) {
    return res.json({ success: false, message: "Please Provide Course ID" })
  }

  let total_amount = 0

  for (const course_id of courses) {
    let course
    try {
      // Find the course by its ID
      course = await Course.findById(course_id)

      // If the course is not found, return an error
      if (!course) {
        return res.status(200).json({ success: false, message: "Could not find the Course" })
      }

      // Check if the user is already enrolled in the course
      const uid = new mongoose.Types.ObjectId(userId)
      const enrolledList = Array.isArray(course.studentsEnroled)
        ? course.studentsEnroled
        : Array.isArray(course.studentsEnrolled)
        ? course.studentsEnrolled
        : []
      if (enrolledList.includes(uid)) {
        return res.status(200).json({ success: false, message: "Student is already Enrolled" })
      }

      // Add the price of the course to the total amount
      total_amount += course.price
    } catch (error) {
      console.log(error)
      return res.status(500).json({ success: false, message: error.message })
    }
  }


  const options = {
    amount: total_amount * 100,
    currency: "INR",
    receipt: Math.random(Date.now()).toString(),
  }

  try {
    // Initiate the payment using Razorpay
    const paymentResponse = await instance.orders.create(options)
    console.log("Razorpay order created:", JSON.stringify(paymentResponse, null, 2))
    console.log("Order options used to create Razorpay order:", JSON.stringify(options, null, 2))
    res.json({
      success: true,
      data: paymentResponse,
    })
  } catch (error) {
    console.log(error)
    res
      .status(500)
      .json({ success: false, message: "Could not initiate order." })
  }
}

// verify the payment
exports.verifyPayment = async (req, res) => {
  const razorpay_order_id = req.body?.razorpay_order_id
  const razorpay_payment_id = req.body?.razorpay_payment_id
  const razorpay_signature = req.body?.razorpay_signature
  const courses = req.body?.courses

  const userId = req.user && req.user.id

  // Enhanced debug logging to help diagnose client 400 errors
  try {
    console.log('verifyPayment called - headers:', JSON.stringify(req.headers || {}, null, 2))
  } catch (e) {
    console.log('verifyPayment called - headers (raw):', req.headers)
  }
  try {
    console.log('verifyPayment called with body:', JSON.stringify(req.body || {}, null, 2))
  } catch (e) {
    console.log('verifyPayment called with body (raw):', req.body)
  }
  console.log('verifyPayment userId:', userId)

  if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature || !courses || !userId) {
    return res.status(400).json({ success: false, message: 'Missing required payment fields' })
  }

  const body = `${razorpay_order_id}|${razorpay_payment_id}`
  let expectedSignature
  try {
    if (!process.env.RAZORPAY_SECRET) {
      console.warn('RAZORPAY_SECRET is not set in environment')
    } else {
      console.log('RAZORPAY_SECRET is set (length):', String(process.env.RAZORPAY_SECRET).length)
    }
    expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_SECRET)
      .update(body.toString())
      .digest('hex')
    console.log('Computed expectedSignature:', expectedSignature)
    console.log('Received razorpay_signature:', razorpay_signature)
  } catch (err) {
    console.error('Error computing expected signature:', err && err.message)
    return res.status(500).json({ success: false, message: 'Server error computing signature' })
  }

  if (expectedSignature === razorpay_signature) {
    try {
      await enrollStudents(courses, userId)
      return res.status(200).json({ success: true, message: 'Payment Verified' })
    } catch (err) {
      console.error('enrollStudents error:', err && err.stack)
      return res.status(500).json({ success: false, message: err.message || 'Failed to enroll students' })
    }
  }
  console.error('Invalid payment signature. Expected:', expectedSignature, 'Received:', razorpay_signature, 'Body:', body)
  return res.status(400).json({ success: false, message: 'Invalid payment signature' })
}

// Send Payment Success Email
exports.sendPaymentSuccessEmail = async (req, res) => {
  const { orderId, paymentId, amount } = req.body

  const userId = req.user.id

  if (!orderId || !paymentId || !amount || !userId) {
    return res
      .status(400)
      .json({ success: false, message: "Please provide all the details" })
  }

  try {
    //find student
    const enrolledStudent = await User.findById(userId)

    await mailSender(//now send email to student
      enrolledStudent.email,
      `Payment Received`,
      paymentSuccessEmail(
        `${enrolledStudent.firstName} ${enrolledStudent.lastName}`,
        amount / 100,
        orderId,
        paymentId
      )
    )
    // respond to client after email is sent
    return res.status(200).json({ success: true, message: "Payment success email sent" })
  } catch (error) {
    console.log("error in sending mail", error)
    console.log('sendPaymentSuccessEmail error stack:', error && error.stack)
    return res.status(500).json({ success: false, message: error.message || "Could not send email" })
  }
}

// enroll the student in the courses
const enrollStudents = async (courses, userId) => {
  if (!courses || !userId) {
    throw new Error("Please Provide Course ID and User ID")
  }

  for (const courseId of courses) {
    try {
      // Find the course and enroll the student in it
      // Add student to both possible fields to maintain compatibility
      const enrolledCourse = await Course.findOneAndUpdate(
        { _id: courseId },
        { $addToSet: { studentsEnroled: userId, studentsEnrolled: userId } },
        { new: true }
      )

      if (!enrolledCourse) {
        throw new Error('Course not found')
      }
      console.log("Updated course: ", enrolledCourse)

      const courseProgress = await CourseProgress.create({
        courseID: courseId,
        userId: userId,
        completedVideos: [],
      })
      // Find the student and add the course to their list of enrolled courses
      const enrolledStudent = await User.findByIdAndUpdate(
        userId,
        {
          $push: {
            courses: courseId,
            courseProgress: courseProgress._id,
          },
        },
        { new: true }
      )

      console.log("Enrolled student: ", enrolledStudent)
      // Send an email notification to the enrolled student
      try {
        const enrollmentTemplate = courseEnrollmentEmail(
          `${enrolledStudent.firstName} ${enrolledStudent.lastName}`,
          enrolledCourse.courseName
        )
        const mailHtml = enrollmentTemplate && enrollmentTemplate.html ? enrollmentTemplate.html : (enrollmentTemplate && enrollmentTemplate.text ? enrollmentTemplate.text : String(enrollmentTemplate))
        const mailSubject = enrollmentTemplate && enrollmentTemplate.subject ? enrollmentTemplate.subject : `Successfully Enrolled into ${enrolledCourse.courseName}`

        const emailResponse = await mailSender(
          enrolledStudent.email,
          mailSubject,
          mailHtml
        )

        console.log('Email sent successfully: ', emailResponse && emailResponse.messageId)
      } catch (mailErr) {
        console.error('mailSender error (non-fatal):', mailErr && mailErr.stack)
      }
      console.log(`Enrolled user ${userId} into course ${courseId}`)
    } catch (error) {
      console.log(error)
      throw error
    }
  }
}

// Log payment failures reported by the client for server-side tracing
exports.logPaymentFailure = async (req, res) => {
  try {
    console.error('Client reported payment failure:', JSON.stringify(req.body, null, 2))
  } catch (e) {
    console.error('Client reported payment failure (raw):', req.body)
  }
  return res.status(200).json({ success: true, message: 'Logged payment failure' })
}

// Create a Razorpay Payment Link as a fallback when checkout fails
exports.createPaymentLink = async (req, res) => {
  const { amount, currency = 'INR', customer } = req.body || {}

  if (!amount || !customer || !customer.email) {
    return res.status(400).json({ success: false, message: 'Missing amount or customer details' })
  }

  try {
    const linkOptions = {
      amount: Math.round(amount), // amount should be in paise if INR
      currency,
      accept_partial: false,
      description: 'Payment for StudyNotion course(s)',
      customer: {
        name: customer.name || '',
        email: customer.email,
        contact: customer.contact || '',
      },
      notify: {
        sms: false,
        email: true,
      },
      remind_auto: true,
    }

    const paymentLink = await instance.paymentLink.create(linkOptions)
    console.log('Created payment link:', JSON.stringify(paymentLink, null, 2))
    return res.status(200).json({ success: true, data: paymentLink })
  } catch (error) {
    console.error('Failed to create payment link:', error)
    return res.status(500).json({ success: false, message: error.message || 'Could not create payment link' })
  }
}