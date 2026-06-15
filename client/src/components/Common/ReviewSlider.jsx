import React, { useEffect, useState } from "react"
import ReactStars from "react-rating-stars-component"
// Import Swiper React components
import { Swiper, SwiperSlide } from "swiper/react"

// Import Swiper styles
import "swiper/css"
import "swiper/css/free-mode"
import "swiper/css/pagination"
import "../../index.css"
// Icons
import { FaStar } from "react-icons/fa"
// Import required modules
import { Autoplay, FreeMode, Pagination } from "swiper/modules"

// Get apiFunction and the endpoint
import { apiConnector } from "../../services/apiConnector"
import { ratingsEndpoints } from "../../services/apis"

function ReviewSlider() {
  const [reviews, setReviews] = useState([])
  const truncateWords = 15

  useEffect(() => {
    ;(async () => {
      const { data } = await apiConnector(
        "GET",
        ratingsEndpoints.REVIEWS_DETAILS_API
      )
      if (data?.success) {
        setReviews(data?.data)
      }
    })()
  }, [])

  // console.log(reviews)

  return (
    <div className="text-white">
      <div className="my-[50px] max-w-maxContentTab lg:max-w-maxContent">
        {reviews.length === 0 ? (
          <div className="text-richblack-500">No reviews yet.</div>
        ) : (
          <Swiper
            slidesPerView={4}
            spaceBetween={25}
            loop={reviews.length > 4}
            freeMode={true}
            autoplay={{
              delay: 2500,
              disableOnInteraction: false,
            }}
            breakpoints={{
              320: { slidesPerView: 1 },
              640: { slidesPerView: 1 },
              768: { slidesPerView: 2 },
              1024: { slidesPerView: 3 },
              1280: { slidesPerView: 4 },
            }}
            modules={[FreeMode, Pagination, Autoplay]}
            className="w-full"
          >
            {reviews.map((review, i) => {
              const reviewText = review?.review || ""
              const truncated =
                reviewText.split(" ").length > truncateWords
                  ? `${reviewText.split(" ").slice(0, truncateWords).join(" ")} ...`
                  : reviewText

              return (
                <SwiperSlide key={i}>
                  <div className="flex flex-col gap-3 bg-richblack-800 p-3 text-[14px] text-richblack-25">
                    <div className="flex items-center gap-4">
                      <img
                        src={
                          review?.user?.image
                            ? review?.user?.image
                            : `https://api.dicebear.com/5.x/initials/svg?seed=${review?.user?.firstName} ${review?.user?.lastName}`
                        }
                        alt=""
                        className="h-9 w-9 rounded-full object-cover"
                      />
                      <div className="flex flex-col">
                        <h1 className="font-semibold text-richblack-5">{`${review?.user?.firstName} ${review?.user?.lastName}`}</h1>
                        <h2 className="text-[12px] font-medium text-richblack-500">
                          {review?.course?.courseName}
                        </h2>
                      </div>
                    </div>
                    <p className="font-medium text-richblack-25">{truncated}</p>
                    <div className="flex items-center gap-2 ">
                      <h3 className="font-semibold text-yellow-100">
                        {review?.rating?.toFixed(1)}
                      </h3>
                      <ReactStars
                        count={5}
                        value={review?.rating || 0}
                        size={20}
                        edit={false}
                        activeColor="#ffd700"
                        emptyIcon={<FaStar />}
                        fullIcon={<FaStar />}
                      />
                    </div>
                  </div>
                </SwiperSlide>
              )
            })}
          </Swiper>
        )}
      </div>
    </div>
  )
}

export default ReviewSlider
