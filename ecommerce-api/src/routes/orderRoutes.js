import { Router } from "express";
import { authRequired } from "../middleware/authMiddleware.js";
import { createOrder, getMyOrderById, getMyOrders } from "../controllers/orderController.js";

const router = Router();

router.post("/", authRequired, createOrder);
router.get("/", authRequired, getMyOrders);
router.get("/:id", authRequired, getMyOrderById);

export default router;
