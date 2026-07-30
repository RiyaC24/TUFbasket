const QRCode = require("qrcode");
require("dotenv").config();

// Builds a standard UPI deep link. Any UPI app (GPay, PhonePe, Paytm, BHIM...)
// can scan/open this to pre-fill the payee, amount and a note.
const buildUpiLink = ({ amount, note }) => {
  const payeeVpa = process.env.UPI_ID;
  const payeeName = process.env.UPI_PAYEE_NAME || "TUFbasket";

  if (!payeeVpa) {
    throw new Error(
      "UPI_ID is not configured on the server. Set it in server/.env"
    );
  }

  const params = new URLSearchParams({
    pa: payeeVpa, // payee address (your UPI ID)
    pn: payeeName, // payee name
    am: Number(amount).toFixed(2), // amount
    cu: "INR",
    tn: note || "Order Payment", // transaction note
  });

  return `upi://pay?${params.toString()}`;
};

const generateUpiQrCode = async ({ amount, note }) => {
  const upiLink = buildUpiLink({ amount, note });
  const qrCodeDataUrl = await QRCode.toDataURL(upiLink, { width: 320 });

  return {
    upiLink,
    qrCodeDataUrl,
    upiId: process.env.UPI_ID,
    payeeName: process.env.UPI_PAYEE_NAME || "TUFbasket",
  };
};

module.exports = { generateUpiQrCode };
