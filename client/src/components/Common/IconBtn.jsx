export default function IconBtn({
  text,
  onclick, // legacy prop name (kept for backward-compat)
  onClick, // preferred prop name
  children,
  disabled,
  outline = false,
  customClasses,
  type,
}) {
  const handleClick = onClick ?? onclick

  return (
    <button
      disabled={disabled}
      onClick={handleClick}
      className={`flex items-center ${
        outline ? "border border-yellow-50 bg-transparent" : "bg-yellow-50"
      } cursor-pointer gap-x-2 rounded-md py-2 px-5 font-semibold text-richblack-900 ${customClasses}`}
      type={type}
    >
      {children ? (
        <>
          <span className={`${outline && "text-yellow-50"}`}>{text}</span>
          {children}
        </>
      ) : (
        text
      )}
    </button>
  )
}
