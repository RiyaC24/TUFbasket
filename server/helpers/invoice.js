const PDFDocument = require("pdfkit");

// Streams a simple invoice PDF for the given order directly to the response.
const generateInvoicePDF = (order, res) => {
  const doc = new PDFDocument({ margin: 50 });

  res.setHeader("Content-Type", "application/pdf");
  res.setHeader(
    "Content-Disposition",
    `attachment; filename=invoice-${order._id}.pdf`
  );

  doc.pipe(res);

  doc.fontSize(20).text("TUFbasket", { align: "left" });
  doc.fontSize(10).fillColor("#555").text("Tax Invoice", { align: "left" });
  doc.moveDown();

  doc.fillColor("#000").fontSize(12);
  doc.text(`Invoice #: ${order._id}`);
  doc.text(`Order Date: ${new Date(order.orderDate).toDateString()}`);
  doc.text(`Payment Status: ${order.paymentStatus}`);
  doc.text(`Order Status: ${order.orderStatus}`);
  doc.moveDown();

  doc.font("Helvetica-Bold").text("Ship To:");
  doc.font("Helvetica");
  doc.text(order.addressInfo?.address || "");
  doc.text(
    `${order.addressInfo?.city || ""} - ${order.addressInfo?.pincode || ""}`
  );
  doc.text(`Phone: ${order.addressInfo?.phone || ""}`);
  doc.moveDown();

  // Table header
  const tableTop = doc.y;
  doc.font("Helvetica-Bold");
  doc.text("Item", 50, tableTop);
  doc.text("Qty", 300, tableTop, { width: 60, align: "right" });
  doc.text("Price", 370, tableTop, { width: 80, align: "right" });
  doc.text("Subtotal", 460, tableTop, { width: 90, align: "right" });
  doc.moveTo(50, tableTop + 15).lineTo(550, tableTop + 15).stroke();

  doc.font("Helvetica");
  let y = tableTop + 25;
  order.cartItems.forEach((item) => {
    doc.text(item.title, 50, y, { width: 240 });
    doc.text(String(item.quantity), 300, y, { width: 60, align: "right" });
    doc.text(`Rs.${item.price}`, 370, y, { width: 80, align: "right" });
    doc.text(`Rs.${(item.price * item.quantity).toFixed(2)}`, 460, y, {
      width: 90,
      align: "right",
    });
    y += 20;
  });

  doc.moveTo(50, y + 5).lineTo(550, y + 5).stroke();
  y += 15;

  if (order.discountAmount) {
    doc.text(`Coupon (${order.couponCode}): -Rs.${order.discountAmount}`, 300, y, {
      width: 250,
      align: "right",
    });
    y += 20;
  }

  doc.font("Helvetica-Bold").text(`Total Paid: Rs.${order.totalAmount}`, 300, y, {
    width: 250,
    align: "right",
  });

  doc.moveDown(3);
  doc.font("Helvetica").fontSize(10).fillColor("#555");
  doc.text("Thank you for shopping with TUFbasket!", { align: "center" });

  doc.end();
};

module.exports = { generateInvoicePDF };
