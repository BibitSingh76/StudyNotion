import React from 'react'
import { FaArrowRight } from "react-icons/fa";
import { Link } from "react-router-dom";
import HighlightText from "../components/core/HomePage/HighlightText";
import CTAButton from "../components/core/HomePage/Button";
import Banner from "../assets/Images/banner.mp4"
import CodeBlocks from "../components/core/HomePage/CodeBlocks";
import TimelineSection from "../components/core/HomePage/TimelineSection"
import LearningLanguageSection from "../components/core/HomePage/LearningLanguageSection";
import InstructorSection from "../components/core/HomePage/InstructorSection";
import Footer from "../components/Common/Footer"
import ExploreMore from '../components/core/HomePage/ExploreMore';
import ReviewSlider from "../components/Common/ReviewSlider"
const Home = () => {
  return (
    <div>
        {/* Section1 */}
        <div className="relative mx-auto flex w-11/12 max-w-maxContent flex-col items-center justify-between gap-8 text-white">
        {/* Become a Instructor Button */}
        <Link to={"/signup"}>
          <div className="group mx-auto mt-16 w-fit rounded-full bg-richblack-800 p-1 font-bold text-richblack-200 drop-shadow-[0_1.5px_rgba(255,255,255,0.25)] transition-all duration-200 hover:scale-95 hover:drop-shadow-none">
            <div className="flex flex-row items-center gap-2 rounded-full px-10 py-[5px] transition-all duration-200 group-hover:bg-richblack-900">
              <p>Become an Instructor</p>
              <FaArrowRight />
            </div>
          </div>
        </Link>

        {/* Heading */}
        <div className='text-center text-4xl font-semibold mt-7'>
          Empower Your Future with
          <HighlightText text={"Coding Skills"} />
        </div>
        {/* subheading */}
        <div className='mt-4 w-[90%] text-center text-lg font-bold text-richblack-300'>
            With our online coding courses, you can learn at your own pace, from
            anywhere in the world, and get access to a wealth of resources,
            including hands-on projects, quizzes, and personalized feedback from
            instructors.
        </div>

        {/* CTA Buttons */}
        <div className="mt-8 flex flex-row gap-7">
            {/* this button link to signup */}
          <CTAButton active={true} linkto={"/signup"}>
            Learn More 
          </CTAButton>
          {/* this button link to login */}
          <CTAButton active={false} linkto={"/login"}>
            Book a Demo
          </CTAButton>
        </div>

        {/* here video part */}
        <div className='mx-3 my-7 shadow-[10px_-5px_50px_-5px] shadow-blue-200'>
            <video
            muted
            loop
            autoPlay
            >
            <source src={Banner} type='video/mp4'/>
            </video>
        </div>

        {/* code section 1*/}
            <div>
              <CodeBlocks
              position={"lg:flex-row"}
              heading={
                <div className='text-4xl font-semibold'>
                    Unlock Your 
                    <HighlightText text={"coding potential"}/>
                    with our online courses
                </div>
              }

              subheading={
              "Go ahead, give it a try. Our hands-on learning environment means you'll be writing real code from your very first lesson."
            }
            ctabtn1={{
              btnText: "Continue Lesson",
              link: "/signup",
              active: true,
            }}
            ctabtn2={{
              btnText: "Learn More",
              link: "/signup",
              active: false,
            }}
            codeColor={"text-white"}
            codeblock={`import React from "react";\n import CTAButton from "./Button";\nimport TypeAnimation from "react-type";\nimport { FaArrowRight } from "react-icons/fa";\n\nconst Home = () => {\nreturn (\n<div>Home</div>\n)\n}\nexport default Home;`}
            backgroundGradient={<div className="codeblock2 absolute"></div>
            }/>  

            </div>
        
        {/* code section 2*/}
            <div>
              <CodeBlocks
              position={"lg:flex-row-reverse"}//here we are sending to codeBlock component same as above but reverse
              heading={
                <div className='text-4xl font-semibold'>
                    Unlock Your 
                    <HighlightText text={"coding potential"}/>
                    with our online courses
                </div>
              }

              subheading={
              "Go ahead, give it a try. Our hands-on learning environment means you'll be writing real code from your very first lesson."
            }
            ctabtn1={{
              btnText: "Continue Lesson",
              link: "/signup",
              active: true,
            }}
            ctabtn2={{
              btnText: "Learn More",
              link: "/signup",
              active: false,
            }}
            codeColor={"text-yellow-25"}
            codeblock={`import React from "react";\n import CTAButton from "./Button";\nimport TypeAnimation from "react-type";\nimport { FaArrowRight } from "react-icons/fa";\n\nconst Home = () => {\nreturn (\n<div>Home</div>\n)\n}\nexport default Home;`}
            backgroundGradient={<div className="codeblock2 absolute"></div>
            }/>  

            </div>
        
        <ExploreMore/>
      </div>
            

        {/* Section2 */}

        <div className='bg-pure-greys-5 text-richblack-700'>
            <div className='homepage_bg h-[310px]'>
              {/* /buttons */}
                <div className='w-11/12 max-w-maxContent flex flex-col items-center justify-between gap-5 mx-auto'>
                <div className='h-[150px]'></div>
                    <div className='flex flex-row gap-7 text-white'>
                      {/* 1st button */}
                        <CTAButton active={true} linkto={"/signup"}>
                            <div className='flex items-center gap-3'>
                                Explore Full Catalog
                                <FaArrowRight/>
                            </div>
                            
                        </CTAButton>

                        {/* 2nd button */}
                        <CTAButton active={false} linkto={"/signup"}>
                            <div className='flex items-center gap-3'>
                                Learn more
              
                            </div>
                            
                        </CTAButton>
                    </div>
                </div>
            </div>

            <div className='mx-auto w-11/12 max-w-maxContent flex flex-col items-center justify-between gap-7'>
                {/* big box */}
                <div className='flex flex-row gap-5 mb-10 mt-[95px]'>
                      {/* 1st box */}
                      <div className='text-4xl font-semibold w-[45%]'>
                        Get the Skills you for a
                        <HighlightText text={"Job that is in demand"}/>
                      </div>
                    
                    {/* 2nd box */}
                    <div className='flex flex-col gap-10 w-[40%] items-start'>
                      <div className='text-[16px]'>
                        The modern StudyNotion is the dictates its own terms. Today, to
                        be a competitive specialist requires more than professional
                        skills.
                      </div>
                      <CTAButton active={true}>
                          <div>
                              Learn more
                          </div>
                      </CTAButton>
                    </div>
                </div>
                
                <TimelineSection/>

                <LearningLanguageSection/>
            </div>


        </div>
        {/* Section3 */}

        <div className="relative mx-auto my-20 flex w-11/12 max-w-maxContent flex-col items-center justify-between gap-8 bg-richblack-900 text-white">
        {/* Become a instructor section */}
        <InstructorSection />

        {/* Reviws from Other Learner */}
        <h1 className="text-center text-4xl font-semibold mt-8">
          Reviews from other learners
        </h1>
        <ReviewSlider />
      </div>

        {/* Section4 */}
        <Footer/>
    </div>
  )
}

export default Home