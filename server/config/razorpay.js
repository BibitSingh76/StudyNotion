const Razorpay = require("razorpay");//take razorpay instance

let instance = null;
if (process.env.RAZORPAY_KEY && process.env.RAZORPAY_SECRET) {
    instance = new Razorpay({
        key_id: process.env.RAZORPAY_KEY,
        key_secret: process.env.RAZORPAY_SECRET,
    });
} else {
    console.warn("Razorpay keys not found in environment; payments disabled.");
}

module.exports = { instance };