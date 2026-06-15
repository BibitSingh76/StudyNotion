import { useEffect, useState } from "react"
import { MdClose } from "react-icons/md"
import { useSelector } from "react-redux"
import { fetchCourseCategories } from "../../../../../services/operations/courseDetailsAPI"

export default function ChipInput({
  label,
  name,
  placeholder,
  register,
  errors,
  setValue,
  getValues,
}) {
  const { editCourse, course } = useSelector((state) => state.course)

  // chips stored as objects: { _id, name }
  const [chips, setChips] = useState([])
  const [availableTags, setAvailableTags] = useState([])
  const [inputValue, setInputValue] = useState("")

  useEffect(() => {
    register(name, {
      required: true,
      validate: (value) => Array.isArray(value) && value.length > 0,
    })

    const loadTags = async () => {
      const tags = await fetchCourseCategories()
      console.log("ChipInput: fetched tags ->", tags)
      setAvailableTags(tags || [])

      // resolve initial values
      if (editCourse && course) {
        const tagVal = course.tag
        if (tagVal) {
          const arr = Array.isArray(tagVal) ? tagVal : [tagVal]
          const mapped = arr
            .map((t) => {
              if (typeof t === "string" && /^[a-fA-F0-9]{24}$/.test(t)) {
                const found = tags.find((x) => x._id === t)
                if (found) return { _id: found._id, name: found.name }
                return null
              }
              if (typeof t === "string") {
                const found = tags.find((x) => x.name === t || x.name === String(t))
                if (found) return { _id: found._id, name: found.name }
              }
              return null
            })
            .filter(Boolean)
          setChips(mapped)
          console.log("ChipInput: initial chips from course ->", mapped)
        }
      } else {
        // not edit mode: check form initial values (ids)
        try {
          const initial = typeof getValues === "function" ? getValues(name) : null
          if (Array.isArray(initial) && initial.length > 0) {
            const mapped = initial
              .map((t) => {
                if (typeof t === "string" && /^[a-fA-F0-9]{24}$/.test(t)) {
                  const found = tags.find((x) => x._id === t)
                  if (found) return { _id: found._id, name: found.name }
                }
                return null
              })
              .filter(Boolean)
            if (mapped.length) setChips(mapped)
            console.log("ChipInput: initial chips from getValues ->", mapped)
          }
        } catch (e) {
          // ignore
        }
      }
    }

    loadTags()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editCourse, course])

  // update form value to array of ids
  useEffect(() => {
    console.log("ChipInput: chips changed ->", chips)
    setValue(name, chips.map((c) => c._id))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chips])

  const addChipByTag = (tagObj) => {
    if (!tagObj) return
    if (chips.find((c) => c._id === tagObj._id)) return
    setChips((prev) => [...prev, { _id: tagObj._id, name: tagObj.name }])
  }

  const handleKeyDown = (event) => {
    if (event.key === "Enter" || event.key === ",") {
      event.preventDefault()
      const val = inputValue.trim()
      if (!val) return
      const lower = val.toLowerCase()
      const exact = availableTags.find((t) => t.name.toLowerCase() === lower)
      if (exact) {
        console.log("ChipInput: adding tag by Enter ->", exact)
        addChipByTag(exact)
        setInputValue("")
        return
      }
      // try suggestions (partial match)
      const suggestions = availableTags.filter((t) => t.name.toLowerCase().includes(lower))
      console.log("ChipInput: suggestions ->", suggestions)
      if (suggestions.length > 0) {
        // pick first suggestion to add
        addChipByTag(suggestions[0])
        setInputValue("")
      } else {
        console.log("Tag not found locally: ", val)
      }
    }
  }

  const handleSelectSuggestion = (tagObj) => {
    console.log("ChipInput: suggestion clicked ->", tagObj)
    addChipByTag(tagObj)
    setInputValue("")
  }

  const handleDeleteChip = (index) => {
    setChips((prev) => prev.filter((_, i) => i !== index))
  }

  return (
    <div className="flex flex-col space-y-2">
      <label className="text-sm text-richblack-5" htmlFor={name}>
        {label} <sup className="text-pink-200">*</sup>
      </label>
      <div className="flex w-full flex-wrap gap-y-2">
        {chips.map((chip, index) => (
          <div
            key={chip._id}
            className="m-1 flex items-center rounded-full bg-yellow-400 px-2 py-1 text-sm text-richblack-5"
          >
            {chip.name}
            <button
              type="button"
              className="ml-2 focus:outline-none"
              onClick={() => handleDeleteChip(index)}
            >
              <MdClose className="text-sm" />
            </button>
          </div>
        ))}

        <div className="relative w-full">
          <input
            id={`${name}-input`}
            type="text"
            placeholder={placeholder}
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            className="form-style w-full"
          />
          {inputValue && (
            <div className="absolute z-10 mt-1 max-h-40 w-full overflow-auto rounded-md bg-richblack-700 p-2">
              {availableTags
                .filter((t) => t.name.toLowerCase().includes(inputValue.toLowerCase()))
                .map((t) => (
                  <div
                    key={t._id}
                    className="cursor-pointer py-1 px-2 hover:bg-richblack-600"
                    onClick={() => handleSelectSuggestion(t)}
                  >
                    {t.name}
                  </div>
                ))}
            </div>
          )}
        </div>
      </div>
      {errors[name] && (
        <span className="ml-2 text-xs tracking-wide text-pink-200">{label} is required</span>
      )}
    </div>
  )
}
