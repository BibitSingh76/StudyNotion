// convert seconds to human readable duration
function convertSecondsToDuration(totalSeconds) {
  if (totalSeconds == null || isNaN(totalSeconds)) return "0s"
  totalSeconds = Number(totalSeconds)
  const hours = Math.floor(totalSeconds / 3600)
  const minutes = Math.floor((totalSeconds % 3600) / 60)
  const seconds = totalSeconds % 60

  const parts = []
  if (hours) parts.push(`${hours}h`)
  if (minutes) parts.push(`${minutes}m`)
  if (seconds || parts.length === 0) parts.push(`${seconds}s`)

  return parts.join(" ")
}

module.exports = {
  convertSecondsToDuration,
}
