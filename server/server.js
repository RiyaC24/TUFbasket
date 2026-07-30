const express = require("express");
const connectToDB = require("./config/db");
const authRouter = require("./routes/auth/auth.routes");
require("dotenv").config();

const commonFeatureRouter = require("./routes/common/feature.routes");
const adminOrderRouter = require("./routes/admin/order.routes");
const adminProductsRouter = require("./routes/admin/product.routes");
const shopProductsRouter = require("./routes/shop/product.routes");
const shopAddressRouter = require("./routes/shop/address.routes");
const shopCartRouter = require("./routes/shop/cart.routes");
const shopOrderRouter = require("./routes/shop/order.routes");
const shopSearchRouter = require("./routes/shop/search.routes");
const shopReviewRouter = require("./routes/shop/review.routes");
const shopCouponRouter = require("./routes/shop/coupon.routes");
const shopWishlistRouter = require("./routes/shop/wishlist.routes");
const adminCouponRouter = require("./routes/admin/coupon.routes");

const cookieParser = require("cookie-parser");
const cors = require("cors");

const app = express();

const PORT = process.env.PORT || 5000;

// Middleware
app.use(cookieParser());
app.use(express.json());

// Connect Database
connectToDB();

// Home Route
app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "🚀 TUFbasket Backend is Running Successfully!",
  });
});

const url = process.env.BASE_URL;

// CORS
app.use(
  cors({
    origin: url,
    methods: ["GET", "POST", "DELETE", "PUT"],
    allowedHeaders: [
      "Content-Type",
      "Authorization",
      "Cache-Control",
      "Expires",
      "Pragma",
    ],
    credentials: true,
  })
);

// Auth Routes
app.use("/api/auth", authRouter);

// Admin Routes
app.use("/api/admin/products", adminProductsRouter);
app.use("/api/admin/orders", adminOrderRouter);
app.use("/api/admin/coupons", adminCouponRouter);

// Shop Routes
app.use("/api/shop/products", shopProductsRouter);
app.use("/api/shop/cart", shopCartRouter);
app.use("/api/shop/address", shopAddressRouter);
app.use("/api/shop/order", shopOrderRouter);
app.use("/api/shop/search", shopSearchRouter);
app.use("/api/shop/review", shopReviewRouter);
app.use("/api/shop/coupon", shopCouponRouter);
app.use("/api/shop/wishlist", shopWishlistRouter);

// Common Feature Routes
app.use("/api/common/feature", commonFeatureRouter);

// Start Server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});