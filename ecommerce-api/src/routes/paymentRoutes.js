import { Router } from "express";
import { createRazorpayOrder } from "../controllers/paymentController.js";

const router = Router();

router.post("/razorpay/order", createRazorpayOrder);

export default router;
