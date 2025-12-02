import { prisma } from "../config/prismaClient.js";

function buildAddressSnapshot(user, body = {}) {
  return {
    addressLine1: body.addressLine1 || user.addressLine1 || null,
    addressLine2: body.addressLine2 || user.addressLine2 || null,
    city: body.city || user.city || null,
    state: body.state || user.state || null,
    postalCode: body.postalCode || user.postalCode || null,
    country: body.country || user.country || null,
    phone: body.phone || user.phone || null
  };
}

export async function createOrder(req, res) {
  try {
    const { items = [], paymentId, razorpayOrderId, razorpaySignature, paymentMethod = "razorpay" } = req.body;

    if (!Array.isArray(items) || !items.length) {
      return res.status(400).json({ message: "No items provided" });
    }

    const productIds = items.map((i) => Number(i.productId)).filter(Boolean);
    if (!productIds.length) return res.status(400).json({ message: "Invalid items" });

    const products = await prisma.product.findMany({
      where: { id: { in: productIds }, active: true },
      include: { productImages: true }
    });

    const productMap = new Map(products.map((p) => [p.id, p]));

    const orderItemsData = [];
    let total = 0;

    for (const item of items) {
      const pid = Number(item.productId);
      const qty = Math.max(Number(item.quantity) || 1, 1);
      const product = productMap.get(pid);
      if (!product) continue;
      const priceNum = Number(product.price);
      total += priceNum * qty;
      orderItemsData.push({ productId: pid, quantity: qty, price: priceNum });
    }

    if (!orderItemsData.length) return res.status(400).json({ message: "No valid items" });

    const user = await prisma.user.findUnique({ where: { id: req.user.id } });
    if (!user) return res.status(401).json({ message: "User not found" });

    const address = buildAddressSnapshot(user, req.body || {});

    const order = await prisma.order.create({
      data: {
        userId: req.user.id,
        totalAmount: total,
        status: paymentId ? "PAID" : "PENDING",
        paymentId,
        razorpayOrderId,
        razorpaySignature,
        paymentMethod,
        ...address,
        items: {
          create: orderItemsData
        }
      },
      include: {
        items: true
      }
    });

    res.json(order);
  } catch (err) {
    console.error("createOrder error:", err);
    res.status(500).json({ message: "Failed to create order" });
  }
}

export async function getMyOrders(req, res) {
  try {
    const orders = await prisma.order.findMany({
      where: { userId: req.user.id },
      orderBy: { id: "desc" },
      include: {
        items: { include: { product: true } }
      }
    });

    res.json(orders);
  } catch (err) {
    console.error("getMyOrders error:", err);
    res.status(500).json({ message: "Failed to fetch orders" });
  }
}

export async function getMyOrderById(req, res) {
  try {
    const { id } = req.params;
    const order = await prisma.order.findFirst({
      where: { id: Number(id), userId: req.user.id },
      include: { items: { include: { product: true } } }
    });

    if (!order) return res.status(404).json({ message: "Order not found" });

    res.json(order);
  } catch (err) {
    console.error("getMyOrderById error:", err);
    res.status(500).json({ message: "Failed to fetch order" });
  }
}
