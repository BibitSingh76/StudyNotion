export const formatDate = (date) => {
  if (!date) return ""
  try {
    return new Date(date).toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    })
  } catch (e) {
    return String(date)
  }
}

export default formatDate
