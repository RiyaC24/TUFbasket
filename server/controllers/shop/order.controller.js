const { generateUpiQrCode } = require("../../helpers/upiQrCode");
const { generateInvoicePDF } = require("../../helpers/invoice");
const Order = require("../../models/order.model");
require("dotenv").config();

// STEP 1: create a pending order and hand back a UPI QR code to scan/pay.
const createOrder = async (req, res) => {
  try {
    const {
      userId,
      cartItems,
      addressInfo,
      orderStatus,
      paymentMethod,
      paymentStatus,
      totalAmount,
      couponCode,
      discountAmount,
      orderDate,
      orderUpdateDate,
      cartId,
    } = req.body;

    if (!cartItems || cartItems.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Your cart is empty. Cannot create order",
      });
    }

    const finalAmount = Number(totalAmount);

    if (!finalAmount || finalAmount <= 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid order amount",
      });
    }

    const newlyCreatedOrder = new Order({
      userId,
      cartId,
      cartItems,
      addressInfo,
      orderStatus: orderStatus || "pending",
      paymentMethod: paymentMethod || "UPI (QR)",
      paymentStatus: paymentStatus || "pending",
      totalAmount: finalAmount,
      couponCode,
      discountAmount: discountAmount || 0,
      orderDate,
      orderUpdateDate,
    });

    await newlyCreatedOrder.save();

    const { upiLink, qrCodeDataUrl, upiId, payeeName } =
      await generateUpiQrCode({
        amount: finalAmount,
        note: `Order ${newlyCreatedOrder._id}`,
      });

    res.status(201).json({
      success: true,
      orderId: newlyCreatedOrder._id,
      amount: finalAmount,
      upiLink,
      qrCodeDataUrl,
      upiId,
      payeeName,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: error.message || "Internal server error, please try again later",
    });
  }
};

// STEP 2: buyer confirms they've paid and (optionally) gives the UPI
// transaction reference (UTR) so the store owner can match it against
// their bank/UPI app. This does NOT mark the order as paid — an admin
// still has to verify and confirm it from the admin dashboard.
const markPaymentSubmitted = async (req, res) => {
  try {
    const { orderId, utrNumber } = req.body;

    const order = await Order.findById(orderId);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order can not be found",
      });
    }

    order.paymentStatus = "pending-verification";
    if (utrNumber) order.utrNumber = utrNumber;
    await order.save();

    res.status(200).json({
      success: true,
      message: "Thanks! We'll confirm your payment shortly.",
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

const getAllOrdersByUser = async (req, res) => {
  try {
    const { userId } = req.params;

    const orders = await Order.find({ userId });

    if (!orders.length) {
      return res.status(404).json({
        success: false,
        message: "No orders found!",
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

const getOrderDetails = async (req, res) => {
  try {
    const { id } = req.params;

    const order = await Order.findById(id);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found!",
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

const downloadInvoice = async (req, res) => {
  try {
    const { id } = req.params;

    const order = await Order.findById(id);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found!",
      });
    }

    generateInvoicePDF(order, res);
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: "Internal server error, please try again later",
    });
  }
};

module.exports = {
  createOrder,
  markPaymentSubmitted,
  getAllOrdersByUser,
  getOrderDetails,
  downloadInvoice,
};
