import { z } from "zod";

export const razorpayCreateOrderSchema = z.object({
  orderId: z.string().trim().min(1).max(128),
});

export const razorpayVerifySchema = z.object({
  order_id: z.string().trim().min(1).max(128),
  razorpay_order_id: z.string().trim().min(1).max(128),
  razorpay_payment_id: z.string().trim().min(1).max(128),
  razorpay_signature: z.string().trim().regex(/^[a-f0-9]{64}$/i),
});
