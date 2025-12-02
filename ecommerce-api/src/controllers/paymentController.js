import Razorpay from "razorpay";
import crypto from "crypto";

const { RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET } = process.env;

function ensureRazorpay() {
  if (!RAZORPAY_KEY_ID || !RAZORPAY_KEY_SECRET) {
    throw new Error("Razorpay keys are not configured in env");
  }
  return new Razorpay({
    key_id: RAZORPAY_KEY_ID,
    key_secret: RAZORPAY_KEY_SECRET
  });
}

export async function createRazorpayOrder(req, res) {
  try {
    const { amount, currency = "INR", receipt } = req.body;
    const numericAmount = Math.max(Math.floor(Number(amount) * 100), 1000); // min 10 INR

    const rz = ensureRazorpay();
    const order = await rz.orders.create({
      amount: numericAmount,
      currency,
      receipt: receipt || crypto.randomUUID(),
      notes: { source: "storefront" }
    });

    res.json({ order, keyId: RAZORPAY_KEY_ID });
  } catch (err) {
    console.error("createRazorpayOrder error:", err);
    res.status(500).json({ message: "Failed to create order" });
  }
}
