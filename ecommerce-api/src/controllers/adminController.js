import { prisma } from "../config/prismaClient.js";
import { r2 } from "../config/r2.js";
import { DeleteObjectsCommand } from "@aws-sdk/client-s3";

async function deleteImagesFromStorage(urls = []) {
  const base = process.env.R2_PUBLIC_URL || "";
  const prefix = base.endsWith("/") ? base : `${base}/`;
  const keys = urls
    .map((url) => {
      if (!prefix) return null;
      if (url.startsWith(prefix)) return url.replace(prefix, "");
      const noSlash = prefix.endsWith("/") ? prefix.slice(0, -1) : prefix;
      return url.startsWith(noSlash) ? url.replace(noSlash, "").replace(/^\/+/, "") : null;
    })
    .filter(Boolean)
    .map((Key) => ({ Key }));

  if (!keys.length) return;

  try {
    await r2.send(
      new DeleteObjectsCommand({
        Bucket: process.env.R2_BUCKET_NAME,
        Delete: { Objects: keys }
      })
    );
  } catch (err) {
    console.error("Failed to delete product images from storage:", err);
  }
}

// ---------------------------
// ADMIN INFO
// ---------------------------
export async function getAdminInfo(req, res) {
  try {
    return res.json({
      id: req.user.id,
      name: req.user.name,
      email: req.user.email,
      role: req.user.role
    });
  } catch (err) {
    console.error("getAdminInfo error:", err);
    res.status(500).json({ message: "Server error" });
  }
}


// ---------------------------
// DASHBOARD STATS
// ---------------------------
export async function getDashboardStats(req, res) {
  try {
    const totalProducts = await prisma.product.count();
    const totalOrders = await prisma.order.count();
    const totalCustomers = await prisma.user.count();

    const totalRevenueData = await prisma.order.aggregate({
      _sum: { totalAmount: true }
    });

    const pendingOrders = await prisma.order.count({
      where: { status: "PENDING" }
    });

    const recentOrders = await prisma.order.findMany({
      take: 5,
      orderBy: { id: "desc" },
      include: { user: true }
    });

    res.json({
      totalProducts,
      totalOrders,
      totalCustomers,
      totalRevenue: totalRevenueData._sum.totalAmount || 0,
      pendingOrders,
      recentOrders
    });
  } catch (err) {
    console.error("getDashboardStats error:", err);
    res.status(500).json({ message: "Server error" });
  }
}



// ---------------------------
// PRODUCT MANAGEMENT
// ---------------------------

// GET ALL PRODUCTS (Admin)
export async function getAdminProducts(req, res) {
  try {
    const products = await prisma.product.findMany({
      include: { productImages: true, category: true },
      orderBy: { id: "desc" }
    });

    res.json(products);
  } catch (err) {
    console.error("getAdminProducts error:", err);
    res.status(500).json({ message: "Server error" });
  }
}


// GET PRODUCT BY ID (Admin)
export async function getAdminProductById(req, res) {
  try {
    const { id } = req.params;

    const product = await prisma.product.findUnique({
      where: { id: Number(id) },
      include: { productImages: true, category: true }
    });

    if (!product)
      return res.status(404).json({ message: "Product not found" });

    res.json(product);
  } catch (err) {
    console.error("getAdminProductById error:", err);
    res.status(500).json({ message: "Server error" });
  }
}


// UPDATE PRODUCT (Admin)
export async function updateAdminProduct(req, res) {
  try {
    const { id } = req.params;
    const data = req.body;
    if (data.categoryId) {
      data.categoryId = Number(data.categoryId);
    }

    const updated = await prisma.product.update({
      where: { id: Number(id) },
      data,
      include: { productImages: true, category: true }
    });

    res.json(updated);
  } catch (err) {
    console.error("updateAdminProduct error:", err);
    res.status(500).json({ message: "Server error" });
  }
}


// DELETE PRODUCT (Admin)
export async function deleteAdminProduct(req, res) {
  try {
    const { id } = req.params;

    const product = await prisma.product.findUnique({
      where: { id: Number(id) },
      include: { productImages: true }
    });

    await prisma.$transaction([
      prisma.orderItem.deleteMany({ where: { productId: Number(id) } }),
      prisma.productImage.deleteMany({ where: { productId: Number(id) } }),
      prisma.product.delete({ where: { id: Number(id) } })
    ]);

    if (product?.productImages?.length) {
      const urls = product.productImages.map((img) => img.url);
      await deleteImagesFromStorage(urls);
    }

    res.json({ message: "Product deleted" });
  } catch (err) {
    console.error("deleteAdminProduct error:", err);
    res.status(500).json({ message: "Server error" });
  }
}



// ---------------------------
// ORDER MANAGEMENT
// ---------------------------

// GET ALL ORDERS
export async function getAdminOrders(req, res) {
  try {
    const orders = await prisma.order.findMany({
      orderBy: { id: "desc" },
      include: {
        user: true,
        items: {
          include: { product: true }
        }
      }
    });

    res.json(orders);
  } catch (err) {
    console.error("getAdminOrders error:", err);
    res.status(500).json({ message: "Server error" });
  }
}


// GET ORDER BY ID
export async function getAdminOrderById(req, res) {
  try {
    const { id } = req.params;

    const order = await prisma.order.findUnique({
      where: { id: Number(id) },
      include: {
        user: true,
        items: { include: { product: true } }
      }
    });

    if (!order)
      return res.status(404).json({ message: "Order not found" });

    res.json(order);
  } catch (err) {
    console.error("getAdminOrderById error:", err);
    res.status(500).json({ message: "Server error" });
  }
}


// UPDATE ORDER STATUS
export async function updateOrderStatus(req, res) {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const updated = await prisma.order.update({
      where: { id: Number(id) },
      data: { status }
    });

    res.json(updated);
  } catch (err) {
    console.error("updateOrderStatus error:", err);
    res.status(500).json({ message: "Server error" });
  }
}



// ---------------------------
// CUSTOMER MANAGEMENT
// ---------------------------

// GET ALL CUSTOMERS
export async function getAdminCustomers(req, res) {
  try {
    const customers = await prisma.user.findMany({
      orderBy: { id: "desc" }
    });

    res.json(customers);
  } catch (err) {
    console.error("getAdminCustomers error:", err);
    res.status(500).json({ message: "Server error" });
  }
}


// GET CUSTOMER BY ID
export async function getAdminCustomerById(req, res) {
  try {
    const { id } = req.params;

    const customer = await prisma.user.findUnique({
      where: { id: Number(id) }
    });

    if (!customer)
      return res.status(404).json({ message: "Customer not found" });

    res.json(customer);
  } catch (err) {
    console.error("getAdminCustomerById error:", err);
    res.status(500).json({ message: "Server error" });
  }
}
