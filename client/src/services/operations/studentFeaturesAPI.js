import { toast } from "react-hot-toast"

import rzpLogo from "../../assets/Logo/rzp_logo.png"
import { resetCart } from "../../slices/cartSlice"
import { setPaymentLoading } from "../../slices/courseSlice"
import { apiConnector } from "../apiConnector"
import { studentEndpoints, profileEndpoints } from "../apis"

const {
  COURSE_PAYMENT_API,
  COURSE_VERIFY_API,
  SEND_PAYMENT_SUCCESS_EMAIL_API,
  COURSE_LOG_PAYMENT_FAILURE_API,
  CREATE_PAYMENT_LINK_API,
} = studentEndpoints

// Load the Razorpay SDK from the CDN
function loadScript(src) {
  return new Promise((resolve) => {
    const script = document.createElement("script")
    script.src = src
    script.onload = () => {
      resolve(true)
    }
    script.onerror = () => {
      resolve(false)
    }
    document.body.appendChild(script)
  })
}

// Buy the Course
export async function BuyCourse(
  token,
  courses,
  user_details,
  navigate,
  dispatch
) {
  const toastId = toast.loading("Loading...")
  try {
    // Loading the script of Razorpay SDK
    const res = await loadScript("https://checkout.razorpay.com/v1/checkout.js")

    if (!res) {
      toast.error(
        "Razorpay SDK failed to load. Check your Internet Connection."
      )
      return
    }

    // Initiating the Order in Backend
    const orderResponse = await apiConnector(
      "POST",
      COURSE_PAYMENT_API,
      {
        courses,
      },
      {
        Authorization: `Bearer ${token}`,
      }
    )

    if (!orderResponse.data.success) {
      throw new Error(orderResponse.data.message)
    }
    // Log full backend response for debugging (order, currency, amount, ids)
    console.log("PAYMENT RESPONSE FROM BACKEND............")
    try {
      console.log(JSON.stringify(orderResponse?.data ?? orderResponse, null, 2))
    } catch (e) {
      console.log("PAYMENT RESPONSE FROM BACKEND (raw):", orderResponse)
    }

    // If user details not present (tracking prevention or storage blocked), try fetching them
    if (!user_details) {
      try {
        const profileResp = await apiConnector("GET", profileEndpoints.GET_USER_DETAILS_API, null, {
          Authorization: `Bearer ${token}`,
        })
        if (profileResp?.data?.success) {
          user_details = profileResp.data.data ?? profileResp.data.userDetails ?? profileResp.data.updatedUserDetails
        }
      } catch (err) {
        console.warn("Could not fetch user details before payment", err)
      }
    }

    // Opening the Razorpay SDK
    const options = {
      key: process.env.REACT_APP_RAZORPAY_KEY || process.env.RAZORPAY_KEY || "",
      currency: orderResponse.data.data.currency,
      amount: orderResponse.data.data.amount,
      order_id: orderResponse.data.data.id,
      name: "StudyNotion",
      description: "Thank you for Purchasing the Course.",
      image: rzpLogo,
      prefill: {
        name: `${user_details?.firstName || ""} ${user_details?.lastName || ""}`.trim(),
        email: user_details?.email || "",
      },
      handler: function (response) {
        sendPaymentSuccessEmail(response, orderResponse.data.data.amount, token)
        verifyPayment({ ...response, courses }, token, navigate, dispatch)
      },
    }

    
    console.log("Razorpay options:", options)
    // Also log the order payload sent by backend (if present) for easier tracing
    try {
      console.log("Razorpay order payload:", JSON.stringify(orderResponse?.data?.data ?? {}, null, 2))
    } catch (e) {
      console.log("Razorpay order payload (raw):", orderResponse?.data?.data)
    }
    const paymentObject = new window.Razorpay(options)

    paymentObject.open()
    paymentObject.on("payment.failed", function (response) {
      // Detailed logging for failure diagnosis
      console.error("RAZORPAY PAYMENT FAILED - full response:", response)
      const err = response?.error || {}
      console.error("RAZORPAY PAYMENT FAILED - error object:", err)
      const code = err.code
      const description = err.description || err.reason || "Payment failed"

      // Log metadata if present (useful for card/country info)
      if (err.metadata) {
        console.error("RAZORPAY PAYMENT FAILED - metadata:", err.metadata)
      }

      if (code === "BAD_REQUEST_ERROR" && /International cards/i.test(description)) {
        toast.error(
          "International cards are not enabled on this account. Enable International payments in your Razorpay Dashboard (complete KYC) or contact Razorpay support. See: https://razorpay.com/docs/payment-gateway/payment-methods/#international-cards"
        )
        // Try to create a Razorpay payment link as a fallback so user can complete payment
        apiConnector(
          "POST",
          CREATE_PAYMENT_LINK_API,
          {
            amount: orderResponse?.data?.data?.amount || orderResponse?.data?.data?.amount,
            currency: orderResponse?.data?.data?.currency || 'INR',
            customer: {
              name: `${user_details?.firstName || ''} ${user_details?.lastName || ''}`.trim(),
              email: user_details?.email || '',
            },
          },
          {
            Authorization: `Bearer ${token}`,
          }
        )
          .then((resp) => {
            try {
              const link = resp?.data?.data?.short_url || resp?.data?.data?.long_url || resp?.data?.data?.url
              if (link) {
                toast.success('Payment link created — opening in a new tab')
                window.open(link, '_blank')
              } else {
                console.warn('Payment link response has no URL:', resp)
              }
            } catch (e) {
              console.warn('Could not open payment link:', e)
            }
          })
          .catch((err) => {
            console.warn('Failed to create payment link fallback:', err)
          })
      } else if (code === "BAD_REQUEST_ERROR" && /UPI/i.test(description)) {
        toast.error(
          "UPI is not available for this merchant or order. Check your Razorpay Dashboard UPI settings or use an alternate payment method. See: https://razorpay.com/docs/payment-gateway/payment-methods/#upi"
        )
        // Try to create a Razorpay payment link as a fallback for UPI failures
        apiConnector(
          "POST",
          CREATE_PAYMENT_LINK_API,
          {
            amount: orderResponse?.data?.data?.amount || orderResponse?.data?.data?.amount,
            currency: orderResponse?.data?.data?.currency || 'INR',
            customer: {
              name: `${user_details?.firstName || ''} ${user_details?.lastName || ''}`.trim(),
              email: user_details?.email || '',
            },
            // include a note to indicate this link was created due to UPI failure
            description: 'Fallback payment link created after UPI failure',
          },
          {
            Authorization: `Bearer ${token}`,
          }
        )
          .then((resp) => {
            try {
              const link = resp?.data?.data?.short_url || resp?.data?.data?.long_url || resp?.data?.data?.url
              if (link) {
                toast.success('Payment link created — opening in a new tab')
                window.open(link, '_blank')
              } else {
                console.warn('Payment link response has no URL:', resp)
              }
            } catch (e) {
              console.warn('Could not open payment link:', e)
            }
          })
          .catch((err) => {
            console.warn('Failed to create payment link fallback for UPI:', err)
          })
      } else {
        toast.error(description)
      }

      // Send failure details to server for persistent logging (best-effort)
      apiConnector(
        "POST",
        COURSE_LOG_PAYMENT_FAILURE_API,
        {
          error: err,
          razorpayResponse: response,
          orderPayload: orderResponse?.data?.data ?? {},
        },
        {
          Authorization: `Bearer ${token}`,
        }
      ).catch((logErr) => {
        console.warn("Failed to log payment failure to server:", logErr)
      })
    })
  } catch (error) {
    console.log("PAYMENT API ERROR............", error)
    toast.error("Student is already Enrolled.")
  }
  toast.dismiss(toastId)
}

// Verify the Payment
async function verifyPayment(bodyData, token, navigate, dispatch) {
  const toastId = toast.loading("Verifying Payment...")
  dispatch(setPaymentLoading(true))
  try {
    console.log("verifyPayment - request body:", bodyData)
    const response = await apiConnector("POST", COURSE_VERIFY_API, bodyData, {
      Authorization: `Bearer ${token}`,
    })

    console.log("VERIFY PAYMENT RESPONSE FROM BACKEND............", response)
    console.log("VERIFY PAYMENT RESPONSE DATA............", response?.data)

    if (!response?.data?.success) {
      const msg = response?.data?.message || "Payment verification failed"
      throw new Error(msg)
    }

    toast.success("Payment Successful. You are Added to the course ")
    navigate("/dashboard/enrolled-courses")
    dispatch(resetCart())
  } catch (error) {
    console.error("PAYMENT VERIFY ERROR............", error)
    // Log Axios response details for easier debugging
    console.error("PAYMENT VERIFY ERROR - status:", error?.response?.status)
    console.error("PAYMENT VERIFY ERROR - headers:", error?.response?.headers)
    console.error("PAYMENT VERIFY ERROR - response.data:", error?.response?.data)

    // Prefer server-provided message or validation errors when available
    const serverData = error?.response?.data
    let msg = error?.message || "Could Not Verify Payment."
    if (serverData) {
      if (serverData.message) msg = serverData.message
      else if (serverData.error) msg = serverData.error
      else if (Array.isArray(serverData.errors) && serverData.errors.length > 0) {
        msg = serverData.errors.map((e) => e.msg || e.message || JSON.stringify(e)).join(", ")
      }
    }

    toast.error(msg)
  } finally {
    toast.dismiss(toastId)
    dispatch(setPaymentLoading(false))
  }
}

// Send the Payment Success Email
async function sendPaymentSuccessEmail(response, amount, token) {
  try {
    await apiConnector(
      "POST",
      SEND_PAYMENT_SUCCESS_EMAIL_API,
      {
        orderId: response.razorpay_order_id,
        paymentId: response.razorpay_payment_id,
        amount,
      },
      {
        Authorization: `Bearer ${token}`,
      }
    )
  } catch (error) {
    console.log("PAYMENT SUCCESS EMAIL ERROR............", error)
  }
}

export default BuyCourse
