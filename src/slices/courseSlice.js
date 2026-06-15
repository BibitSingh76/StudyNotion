import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  step: 1,
  course: {
    courseContent: [],
  },
  editCourse: false,
  paymentLoading: false,
  editCourseDetails: null,
};

const courseSlice = createSlice({
  name: "course",
  initialState,
  reducers: {
    setStep(state, action) {
      state.step = action.payload;
    },
    setCourse(state, action) {
      state.course = action.payload;
    },
    setEditCourse(state, action) {
      state.editCourse = action.payload;
    },
    setPaymentLoading(state, action) {
      state.paymentLoading = action.payload;
    },
    resetCourseState(state) {
      state.step = 1;
      state.course = { courseContent: [] };
      state.editCourse = false;
      state.paymentLoading = false;
      state.editCourseDetails = null;
    },
    setEditCourseDetails(state, action) {
      state.editCourseDetails = action.payload;
    },
  },
});

export const {
  setStep,
  setCourse,
  setEditCourse,
  setPaymentLoading,
  resetCourseState,
  setEditCourseDetails,
} = courseSlice.actions;

export default courseSlice.reducer;
