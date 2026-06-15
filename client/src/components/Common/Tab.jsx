import React from "react"

const Tab = ({ tabData = [], field, setField }) => {
  return (
    <div className="flex gap-4">
      {tabData.map((tab) => (
        <button
          key={tab.id}
          onClick={() => setField(tab.type)}
          className={`px-4 py-2 rounded-md font-medium transition-colors ${
            field === tab.type
              ? "bg-yellow-50 text-richblack-900"
              : "bg-richblack-700 text-richblack-300"
          }`}
        >
          {tab.tabName}
        </button>
      ))}
    </div>
  )
}

export default Tab
