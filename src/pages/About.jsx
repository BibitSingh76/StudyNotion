import React, { useEffect } from "react"

import FoundingStory from "../assets/Images/FoundingStory.png"
import BannerImage1 from "../assets/Images/aboutus1.webp"
import BannerImage2 from "../assets/Images/aboutus2.webp"
import BannerImage3 from "../assets/Images/aboutus3.webp"
import Footer from "../components/Common/Footer"
import ReviewSlider from "../components/Common/ReviewSlider"
import ContactFormSection from "../components/core/AboutPage/ContactFormSection"
import LearningGrid from "../components/core/AboutPage/LearningGrid"
import Quote from "../components/core/AboutPage/Quote"
import StatsComponenet from "../components/core/AboutPage/Stats"
import HighlightText from "../components/core/HomePage/HighlightText"

const About = () => {

  return (
    <div className="bg-gradient-to-b from-richblack-900 via-richblack-800 to-richblack-900 text-white">

      {/* SECTION 1 */}
      <section className="relative overflow-hidden">
        <div className="mx-auto w-11/12 max-w-maxContent text-center py-24">

          <header className="text-4xl font-bold lg:w-[70%] mx-auto leading-tight">
            Driving Innovation in Online Education for a{" "}
            <HighlightText text={"Brighter Future"} />

            <p className="mt-6 text-richblack-300 text-base">
              Studynotion is at the forefront of innovation in online education.
              We create a smarter, brighter learning experience.
            </p>
          </header>

          {/* Images */}
          <div className="mt-16 grid grid-cols-3 gap-4">
            {[BannerImage1, BannerImage2, BannerImage3].map((img, i) => (
              <img
                key={i}
                src={img}
                alt=""
                className="rounded-xl shadow-lg hover:scale-105 transition-all duration-500 hover:shadow-pink-500/30"
              />
            ))}
          </div>
        </div>
      </section>

      {/* SECTION 2 */}
      <section className="border-b border-richblack-700 py-16">
        <div className="mx-auto w-11/12 max-w-maxContent text-center">
          <Quote />
        </div>
      </section>

      {/* SECTION 3 */}
      <section className="py-20">
        <div className="mx-auto w-11/12 max-w-maxContent flex flex-col gap-16">

          {/* Founding Story */}
          <div className="flex flex-col lg:flex-row items-center gap-10">
            
            <div className="backdrop-blur-md bg-white/5 p-8 rounded-2xl shadow-xl hover:scale-[1.02] transition duration-300">
              <h1 className="text-4xl font-bold bg-gradient-to-r from-pink-500 to-yellow-500 text-transparent bg-clip-text">
                Our Founding Story
              </h1>

              <p className="mt-4 text-richblack-300">
                Our e-learning platform was born out of a shared vision to make education accessible.
              </p>

              <p className="mt-4 text-richblack-300">
                We wanted to break barriers and bring learning to everyone, everywhere.
              </p>
            </div>

            <img
              src={FoundingStory}
              alt=""
              className="rounded-2xl shadow-2xl hover:scale-105 transition duration-500 hover:shadow-pink-500/40"
            />
          </div>

          {/* Vision + Mission */}
          <div className="flex flex-col lg:flex-row gap-10">

            <div className="flex-1 backdrop-blur-md bg-white/5 p-8 rounded-2xl shadow-xl hover:scale-[1.02] transition">
              <h1 className="text-3xl font-bold bg-gradient-to-r from-orange-400 to-yellow-500 text-transparent bg-clip-text">
                Our Vision
              </h1>
              <p className="mt-4 text-richblack-300">
                To revolutionize learning through technology and innovation.
              </p>
            </div>

            <div className="flex-1 backdrop-blur-md bg-white/5 p-8 rounded-2xl shadow-xl hover:scale-[1.02] transition">
              <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 text-transparent bg-clip-text">
                Our Mission
              </h1>
              <p className="mt-4 text-richblack-300">
                To create a community-driven platform where knowledge thrives.
              </p>
            </div>

          </div>

        </div>
      </section>

      {/* SECTION 4 */}
      <StatsComponenet />

      {/* SECTION 5 */}
      <section className="mx-auto mt-20 w-11/12 max-w-maxContent flex flex-col gap-10">
        <LearningGrid />
        <ContactFormSection />
      </section>

      {/* REVIEWS */}
      <div className="mx-auto my-20 w-11/12 max-w-maxContent text-center">
        <h1 className="text-4xl font-bold mb-8">
          Reviews from other learners
        </h1>

        <div className="bg-white/5 backdrop-blur-md rounded-2xl p-6 shadow-xl">
          <ReviewSlider />
        </div>
      </div>

      <Footer />
    </div>
  )
}

export default About