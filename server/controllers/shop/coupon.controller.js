const Coupon = require("../../models/coupon.model");

// Validates a coupon against the cart total and returns the discount to apply.
// Does NOT increment usedCount — that happens once the order is actually paid.
const applyCoupon = async (req, res) => {
  try {
    const { code, cartTotal } = req.body;

    if (!code) {
      return res
        .status(400)
        .json({ success: false, message: "Coupon code is required" });
    }

    const coupon = await Coupon.findOne({ code: code.toUpperCase().trim() });

    if (!coupon || !coupon.isActive) {
      return res
        .status(404)
        .json({ success: false, message: "Invalid or inactive coupon code" });
    }

    if (coupon.expiryDate && new Date(coupon.expiryDate) < new Date()) {
      return res
        .status(400)
        .json({ success: false, message: "This coupon has expired" });
    }

    if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) {
      return res
        .status(400)
        .json({ success: false, message: "This coupon has reached its usage limit" });
    }

    if (coupon.minOrderAmount && cartTotal < coupon.minOrderAmount) {
      return res.status(400).json({
        success: false,
        message: `Minimum order amount of ₹${coupon.minOrderAmount} required for this coupon`,
      });
    }

    let discountAmount =
      coupon.discountType === "percentage"
        ? (cartTotal * coupon.discountValue) / 100
        : coupon.discountValue;

    if (coupon.maxDiscountAmount) {
      discountAmount = Math.min(discountAmount, coupon.maxDiscountAmount);
    }

    discountAmount = Math.min(discountAmount, cartTotal);
    discountAmount = Number(discountAmount.toFixed(2));

    res.status(200).json({
      success: true,
      data: {
        code: coupon.code,
        discountAmount,
        finalAmount: Number((cartTotal - discountAmount).toFixed(2)),
      },
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: "Internal server error, please try again later",
    });
  }
};

module.exports = { applyCoupon };
