const express = require("express");
const {
  getAllOrdersOfAllUsers,
  getOrderDetailsForAdmin,
  updateOrderStatus,
  verifyPayment,
  rejectPayment,
} = require("../../controllers/admin/order.controller");

const router = express.Router();

router.get("/get", getAllOrdersOfAllUsers);
router.get("/details/:id", getOrderDetailsForAdmin);
router.put("/update/:id", updateOrderStatus);
router.put("/verify-payment/:id", verifyPayment);
router.put("/reject-payment/:id", rejectPayment);

module.exports = router;
