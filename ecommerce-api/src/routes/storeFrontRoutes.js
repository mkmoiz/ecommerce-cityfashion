import { Router } from "express";
import {
  listProducts,
  getProductBySlug,
  searchProducts,
  filterProducts,
  getRelatedProducts,
  listCategories,
  getCategoryWithProducts
} from "../controllers/storeFrontController.js";

const router = Router();

router.get("/products", listProducts);
router.get("/products/search", searchProducts);
router.get("/products/filter", filterProducts);
router.get("/products/related/:id", getRelatedProducts);
router.get("/products/:slug", getProductBySlug);

router.get("/categories", listCategories);
router.get("/categories/:slug", getCategoryWithProducts);

export default router;
