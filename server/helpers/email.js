const nodemailer = require("nodemailer");
require("dotenv").config();

// Uses any SMTP provider (Gmail, SendGrid, Mailtrap, etc). Configure via .env.
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT) || 587,
  secure: Number(process.env.SMTP_PORT) === 465,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

const sendOrderConfirmationEmail = async ({ to, order }) => {
  // If SMTP isn't configured, skip silently instead of crashing checkout.
  if (!process.env.SMTP_USER || !process.env.SMTP_PASS || !to) {
    console.log("SMTP not configured or no recipient email — skipping order confirmation email.");
    return { skipped: true };
  }

  const itemsHtml = order.cartItems
    .map(
      (item) =>
        `<tr>
          <td style="padding:8px;border-bottom:1px solid #eee;">${item.title}</td>
          <td style="padding:8px;border-bottom:1px solid #eee;text-align:center;">${item.quantity}</td>
          <td style="padding:8px;border-bottom:1px solid #eee;text-align:right;">₹${item.price}</td>
        </tr>`
    )
    .join("");

  const html = `
    <div style="font-family:Arial,sans-serif;max-width:600px;margin:auto;">
      <h2>Thanks for your order!</h2>
      <p>Your order <strong>${order._id}</strong> has been confirmed.</p>
      <table style="width:100%;border-collapse:collapse;margin-top:16px;">
        <thead>
          <tr>
            <th style="text-align:left;padding:8px;border-bottom:2px solid #333;">Item</th>
            <th style="text-align:center;padding:8px;border-bottom:2px solid #333;">Qty</th>
            <th style="text-align:right;padding:8px;border-bottom:2px solid #333;">Price</th>
          </tr>
        </thead>
        <tbody>${itemsHtml}</tbody>
      </table>
      ${
        order.discountAmount
          ? `<p style="margin-top:8px;">Coupon (${order.couponCode}) applied: -₹${order.discountAmount}</p>`
          : ""
      }
      <h3 style="text-align:right;margin-top:16px;">Total Paid: ₹${order.totalAmount}</h3>
      <p>Payment method: ${order.paymentMethod || "UPI"}</p>
      <p>We'll notify you once your order ships. You can view or download your invoice anytime from your account's Orders page.</p>
    </div>
  `;

  try {
    await transporter.sendMail({
      from: process.env.SMTP_FROM || process.env.SMTP_USER,
      to,
      subject: `Order Confirmed — #${order._id}`,
      html,
    });
    return { skipped: false };
  } catch (error) {
    console.log("Failed to send order confirmation email:", error.message);
    return { skipped: true, error: error.message };
  }
};

module.exports = { sendOrderConfirmationEmail };
