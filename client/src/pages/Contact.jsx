import React from "react"

import Footer from "../components/Common/Footer"
import ReviewSlider from "../components/Common/ReviewSlider"
import ContactDetails from "../components/core/ContactUsPage/ContactDetails"
import ContactForm from "../components/core/ContactUsPage/ContactForm"

const Contact = () => {
  return (
    <div className="bg-gradient-to-b from-richblack-900 via-richblack-800 to-richblack-900 min-h-screen">
      
      {/* Main Section */}
      <div className="mx-auto mt-16 flex w-11/12 max-w-maxContent flex-col justify-between gap-12 text-white lg:flex-row">
        
        {/* Contact Details Card */}
        <div className="lg:w-[40%] bg-richblack-800 p-6 rounded-2xl shadow-xl border border-richblack-700 hover:shadow-2xl transition-all duration-300">
          <ContactDetails />
        </div>

        {/* Contact Form Card */}
        <div className="lg:w-[60%] bg-richblack-800 p-8 rounded-2xl shadow-xl border border-richblack-700 hover:shadow-2xl transition-all duration-300">
          <ContactForm />
        </div>
      </div>

      {/* Reviews Section */}
      <div className="relative mx-auto my-24 flex w-11/12 max-w-maxContent flex-col items-center gap-10 text-white">
        
        {/* Heading */}
        <div className="text-center">
          <h1 className="text-4xl font-bold">
            What Our Learners Say 💬
          </h1>
          <p className="text-richblack-300 mt-2">
            Real feedback from our community
          </p>
        </div>

        {/* Review Slider Card */}
        <div className="w-full bg-richblack-800 p-6 rounded-2xl shadow-lg border border-richblack-700">
          <ReviewSlider />
        </div>
      </div>

      <Footer />
    </div>
  )
}

export default Contact