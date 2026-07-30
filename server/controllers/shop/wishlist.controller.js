const Wishlist = require("../../models/wishlist.model");

const getWishlist = async (req, res) => {
  try {
    const { userId } = req.params;

    let wishlist = await Wishlist.findOne({ userId }).populate("products");

    if (!wishlist) {
      wishlist = await new Wishlist({ userId, products: [] }).save();
    }

    res.status(200).json({ success: true, data: wishlist });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: "Internal server error, please try again later",
    });
  }
};

const addToWishlist = async (req, res) => {
  try {
    const { userId, productId } = req.body;

    if (!userId || !productId) {
      return res.status(400).json({
        success: false,
        message: "userId and productId are required",
      });
    }

    let wishlist = await Wishlist.findOne({ userId });

    if (!wishlist) {
      wishlist = new Wishlist({ userId, products: [productId] });
    } else if (!wishlist.products.includes(productId)) {
      wishlist.products.push(productId);
    }

    await wishlist.save();
    await wishlist.populate("products");

    res.status(200).json({ success: true, data: wishlist });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: "Internal server error, please try again later",
    });
  }
};

const removeFromWishlist = async (req, res) => {
  try {
    const { userId, productId } = req.params;

    const wishlist = await Wishlist.findOne({ userId });

    if (!wishlist) {
      return res
        .status(404)
        .json({ success: false, message: "Wishlist not found" });
    }

    wishlist.products = wishlist.products.filter(
      (id) => id.toString() !== productId
    );

    await wishlist.save();
    await wishlist.populate("products");

    res.status(200).json({ success: true, data: wishlist });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: "Internal server error, please try again later",
    });
  }
};

module.exports = { getWishlist, addToWishlist, removeFromWishlist };
