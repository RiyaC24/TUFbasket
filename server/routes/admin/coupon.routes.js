const express = require("express");
const {
  addCoupon,
  getAllCoupons,
  toggleCoupon,
  deleteCoupon,
} = require("../../controllers/admin/coupon.controller");

const router = express.Router();

router.post("/add", addCoupon);
router.get("/list", getAllCoupons);
router.put("/toggle/:id", toggleCoupon);
router.delete("/:id", deleteCoupon);

module.exports = router;
