const Category = require("../models/Category")
const Course = require("../models/Course")

function getRandomInt(max) {
  return Math.floor(Math.random() * max)
}

exports.createCategory = async (req, res) => {
  try {
    const { name, description } = req.body
    if (!name) {
      return res
        .status(400)
        .json({ success: false, message: "All fields are required" })
    }

    const CategorysDetails = await Category.create({//document creating in mongoDB(here using Category variable which connect to models)
      name: name,
      description: description,
    })
    console.log(CategorysDetails)
    return res.status(200).json({
      success: true,
      message: "Categorys Created Successfully",
    })
  } catch (error) {
    return res.status(500).json({
      success: true,
      message: error.message,
    })
  }
}

exports.showAllCategories = async (req, res) => {
  try {
    const allCategorys = await Category.find()//finding categories from data base
    //populate convert ObjectId -> actual document
      .populate({//means->put all course in corresponding  category only ->published other will remove
        path: "courses",
        match: { status: "Published" },
      })
      .exec()

    res.status(200).json({
      success: true,
      data: allCategorys,
    })
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    })
  }
}

exports.categoryPageDetails = async (req, res) => {
  try {
    const { categoryId } = req.body

    // Get category details
    const selectedCategory = await Category.findById(categoryId).exec()

    // Get courses for the specified category directly from Course collection
    const selectedCourses = await Course.find({
      category: categoryId,
      status: "Published",
    })
      .populate("ratingAndReviews")
      .exec()

    // attach courses array to the selectedCategory for compatibility
    if (selectedCategory) selectedCategory.courses = selectedCourses

    console.log("SELECTED COURSE", selectedCategory)
    // Handle the case when the category is not found
    if (!selectedCategory) {
      console.log("Category not found.")
      return res
        .status(404)
        .json({ success: false, message: "Category not found" })
    }
    // Handle the case when there are no courses
    if (selectedCategory.courses.length === 0) {
      console.log("No courses found for the selected category.")
      return res.status(404).json({
        success: false,
        message: "No courses found for the selected category.",
      })
    }

    // Get a different category and its published courses
    const categoriesExceptSelected = await Category.find({ _id: { $ne: categoryId } }).exec()
    let differentCategory = null
    if (categoriesExceptSelected.length > 0) {
      const randomCat = categoriesExceptSelected[getRandomInt(categoriesExceptSelected.length)]
      differentCategory = randomCat.toObject()
      const differentCourses = await Course.find({ category: differentCategory._id, status: "Published" }).exec()
      differentCategory.courses = differentCourses
    }
    console.log()
    // Get top-selling courses across all categories
    // Get all published courses across all categories
    const allCourses = await Course.find({ status: "Published" }).exec()
    const mostSellingCourses = allCourses
      .sort((a, b) => b.sold - a.sold)
      .slice(0, 10)

    res.status(200).json({
      success: true,
      data: {
        selectedCategory,
        differentCategory,
        mostSellingCourses,
      },
    })
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    })
  }
}

// Diagnostic: compare populate(...) with a direct Course.find for debugging
exports.categoryDiagnostics = async (req, res) => {
  try {
    const { categoryId } = req.body
    if (!categoryId) {
      return res.status(400).json({ success: false, message: 'categoryId is required' })
    }

    // Populate result using match filter
    const populated = await Category.findById(categoryId)
      .populate({ path: 'courses', match: { status: 'Published' } })
      .exec()

    // Raw category document (lean for performance)
    const rawCategory = await Category.findById(categoryId).lean()

    // Direct query to Course collection using the IDs found in category.courses
    let directFind = []
    if (rawCategory && Array.isArray(rawCategory.courses) && rawCategory.courses.length > 0) {
      directFind = await Course.find({ _id: { $in: rawCategory.courses }, status: 'Published' }).exec()
    }

    return res.status(200).json({
      success: true,
      data: {
        populated: populated ? populated.courses : [],
        directFind,
        rawCategory,
      },
    })
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message })
  }
}
