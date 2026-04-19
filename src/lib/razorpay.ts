import Razorpay from "razorpay";

export function getInstance(key_id: string, key_secret: string) {
  return new Razorpay({
    key_id,
    key_secret,
  });
}