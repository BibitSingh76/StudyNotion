import React from "react"

export default function CourseSubSectionAccordion({ subSec }) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-md bg-richblack-800 px-4 py-3">
      <div className="flex flex-col">
        <p className="text-sm font-semibold text-richblack-5">
          {subSec?.title || subSec?.lectureTitle || "Untitled Lecture"}
        </p>
        {subSec?.description && (
          <p className="text-xs text-richblack-300 mt-1 line-clamp-2">
            {subSec.description}
          </p>
        )}
      </div>
      <div className="text-xs text-richblack-400">
        {subSec?.timeDuration || subSec?.duration || ""}
      </div>
    </div>
  )
}
