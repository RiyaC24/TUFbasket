const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema({
  userId: String,
  cartId: String,
  cartItems: [
    {
      productId: String,
      title: String,
      image: String,
      price: Number,
      quantity: Number,
    },
  ],
  addressInfo: {
    userId: String,
    address: String,
    city: String,
    pincode: Number,
    phone: Number,
    notes: String,
  },
  // orderStatus tracks fulfilment: pending -> inProcess -> inShipping -> delivered / rejected
  orderStatus: String,
  paymentMethod: String,
  // paymentStatus tracks money: pending -> pending-verification -> paid / failed
  paymentStatus: String,
  totalAmount: Number,
  couponCode: String,
  discountAmount: {
    type: Number,
    default: 0,
  },
  orderDate: Date,
  orderUpdateDate: Date,
  // UPI QR payment — no gateway, so we rely on the buyer's UPI transaction
  // reference (UTR) and manual admin verification.
  utrNumber: String,
  paymentVerifiedAt: Date,
});

module.exports = mongoose.model("Order", orderSchema);
