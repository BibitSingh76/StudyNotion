import { createSlice } from "@reduxjs/toolkit"

const initialState = {
  completedLectures: [],
  currentCourse: null,
  courseSectionData: [],
  courseEntireData: null,
  totalNoOfLectures: 0,
}

const viewCourseSlice = createSlice({
  name: "viewCourse",
  initialState,
  reducers: {
    updateCompletedLectures(state, action) {
      state.completedLectures = action.payload
    },
    setCurrentCourse(state, action) {
      state.currentCourse = action.payload
    },
    setCourseSectionData(state, action) {
      state.courseSectionData = action.payload
    },
    setEntireCourseData(state, action) {
      state.courseEntireData = action.payload
    },
    setCompletedLectures(state, action) {
      state.completedLectures = action.payload
    },
    setTotalNoOfLectures(state, action) {
      state.totalNoOfLectures = action.payload
    },
    resetViewCourseState(state) {
      state.completedLectures = []
      state.currentCourse = null
    },
  },
})

export const {
  updateCompletedLectures,
  setCurrentCourse,
  setCourseSectionData,
  setEntireCourseData,
  setCompletedLectures,
  setTotalNoOfLectures,
  resetViewCourseState,
} = viewCourseSlice.actions

export default viewCourseSlice.reducer
