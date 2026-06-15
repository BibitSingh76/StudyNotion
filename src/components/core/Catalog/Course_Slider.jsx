import React, { useEffect, useState } from "react"
// Import Swiper React components
import { Swiper, SwiperSlide } from "swiper/react"

// Import Swiper styles
import "swiper/css"
import "swiper/css/free-mode"
import "swiper/css/pagination"
// import "../../.."
// Import required modules
import { FreeMode, Pagination } from "swiper/modules"

// import { getAllCourses } from "../../services/operations/courseDetailsAPI"
import Course_Card from "./Course_Card"

function Course_Slider({ Courses }) {
  const [slidesPerView, setSlidesPerView] = useState(1)

  useEffect(() => {
    const update = () => {
      setSlidesPerView(window.innerWidth >= 1024 ? 3 : 1)
    }
    update()
    window.addEventListener("resize", update)
    return () => window.removeEventListener("resize", update)
  }, [])

  const shouldLoop = (Courses?.length || 0) > slidesPerView

  return (
    <>
      {Courses?.length ? (
        <Swiper
          slidesPerView={slidesPerView}
          spaceBetween={25}
          loop={shouldLoop}
          modules={[FreeMode, Pagination]}
          className="max-h-[30rem]"
        >
          {Courses?.map((course, i) => (
            <SwiperSlide key={i}>
              <Course_Card course={course} Height={"h-[250px]"} />
            </SwiperSlide>
          ))}
        </Swiper>
      ) : (
        <p className="text-xl text-richblack-5">No Course Found</p>
      )}
    </>
  )
}

export default Course_Slider
