const Order = require("../../models/order.model");
const Product = require("../../models/product.model");
const CartModel = require("../../models/cart.model");
const Coupon = require("../../models/coupon.model");
const User = require("../../models/user.model");
const { sendOrderConfirmationEmail } = require("../../helpers/email");

const getAllOrdersOfAllUsers = async (req, res) => {
  try {
    let orders = await Order.find({});

    if (!orders.length) {
      return res.status(404).json({
        success: false,
        message: "No orders found",
      });
    }

    res.status(200).json({
      success: true,
      data: orders,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: "Internal server error, please try again later",
    });
  }
};

const getOrderDetailsForAdmin = async (req, res) => {
  try {
    const { id } = req.params;

    const order = await Order.findById(id);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    res.status(200).json({
      success: true,
      data: order,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: "Internal server error, please try again later",
    });
  }
};

const updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { orderStatus } = req.body;

    const order = await Order.findById(id);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found!",
      });
    }

    await Order.findByIdAndUpdate(id, { orderStatus });

    res.status(200).json({
      success: true,
      message: "Order status updated successfully!",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Internal server error, please try again later",
    });
  }
};

// Admin checks their UPI app / bank statement, matches the order amount and
// UTR the buyer submitted, then confirms it here. This is the moment stock
// actually gets reserved, the cart is cleared, the coupon usage is counted,
// and the buyer gets their confirmation email.
const verifyPayment = async (req, res) => {
  try {
    const { id } = req.params;

    const order = await Order.findById(id);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found!",
      });
    }

    if (order.paymentStatus === "paid") {
      return res.status(200).json({
        success: true,
        message: "Payment was already verified for this order",
        data: order,
      });
    }

    for (let item of order.cartItems) {
      let product = await Product.findById(item.productId);

      if (!product || product.totalStock < item.quantity) {
        return res.status(400).json({
          success: false,
          message: `Not enough stock for ${item.title}`,
        });
      }

      product.totalStock -= item.quantity;
      await product.save();
    }

    if (order.couponCode) {
      await Coupon.findOneAndUpdate(
        { code: order.couponCode },
        { $inc: { usedCount: 1 } }
      );
    }

    if (order.cartId) {
      await CartModel.findByIdAndDelete(order.cartId);
    }

    order.paymentStatus = "paid";
    order.orderStatus =
      order.orderStatus === "pending" ? "inProcess" : order.orderStatus;
    order.paymentVerifiedAt = new Date();
    await order.save();

    User.findById(order.userId)
      .then((user) => {
        if (user?.email) {
          sendOrderConfirmationEmail({ to: user.email, order });
        }
      })
      .catch((err) => console.log("Could not load user for email:", err.message));

    res.status(200).json({
      success: true,
      message: "Payment verified and order confirmed!",
      data: order,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Internal server error, please try again later",
    });
  }
};

// Use this if the buyer claimed they paid but the UTR / amount doesn't
// actually show up on your end.
const rejectPayment = async (req, res) => {
  try {
    const { id } = req.params;

    const order = await Order.findById(id);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found!",
      });
    }

    order.paymentStatus = "failed";
    await order.save();

    res.status(200).json({
      success: true,
      message: "Payment marked as failed",
      data: order,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Internal server error, please try again later",
    });
  }
};

module.exports = {
  getAllOrdersOfAllUsers,
  getOrderDetailsForAdmin,
  updateOrderStatus,
  verifyPayment,
  rejectPayment,
};
