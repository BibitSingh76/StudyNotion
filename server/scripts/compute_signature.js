// compute_signature.js
const crypto = require('crypto');

if (process.argv.length < 5) {
  console.error('Usage: node compute_signature.js <order_id> <payment_id> <secret>');
  process.exit(1);
}

const [orderId, paymentId, secret] = process.argv.slice(2);
const body = `${orderId}|${paymentId}`;
const expected = crypto.createHmac('sha256', secret).update(body).digest('hex');
console.log('body:', body);
console.log('expectedSignature:', expected);
