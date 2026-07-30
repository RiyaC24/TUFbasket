const express = require("express");
const {
  getWishlist,
  addToWishlist,
  removeFromWishlist,
} = require("../../controllers/shop/wishlist.controller");

const router = express.Router();

router.get("/:userId", getWishlist);
router.post("/add", addToWishlist);
router.delete("/:userId/:productId", removeFromWishlist);

module.exports = router;
