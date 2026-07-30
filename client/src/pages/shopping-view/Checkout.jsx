import Address from "@/components/shopping-view/Address";
import img from "../../assets/account.jpg";
import { useDispatch, useSelector } from "react-redux";
import UserCartItemsContent from "@/components/shopping-view/CartItemContent";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { useState } from "react";
import {
  createNewOrder,
  markPaymentSubmitted,
  applyCoupon,
  resetCoupon,
  resetCurrentPayment,
} from "@/store/shop/orderSlice";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/components/ui/UseToast";
import { BadgeCheck, Tag, X, QrCode, ExternalLink } from "lucide-react";

function ShoppingCheckout() {
  const { cartItems } = useSelector((state) => state.shopCart);
  const { user } = useSelector((state) => state.auth);
  const { appliedCoupon, couponError, currentPayment } = useSelector(
    (state) => state.shopOrder
  );
  const [currentSelectedAddress, setCurrentSelectedAddress] = useState(null);
  const [isCreatingOrder, setIsCreatingOrder] = useState(false);
  const [isSubmittingPayment, setIsSubmittingPayment] = useState(false);
  const [couponCode, setCouponCode] = useState("");
  const [isApplyingCoupon, setIsApplyingCoupon] = useState(false);
  const [utrNumber, setUtrNumber] = useState("");
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { toast } = useToast();

  const totalCartAmount =
    cartItems && cartItems.items && cartItems.items.length > 0
      ? cartItems.items.reduce(
          (sum, currentItem) =>
            sum +
            (currentItem?.salePrice > 0
              ? currentItem?.salePrice
              : currentItem?.price) *
              currentItem?.quantity,
          0
        )
      : 0;

  const discountAmount = appliedCoupon?.discountAmount || 0;
  const finalAmount = Number((totalCartAmount - discountAmount).toFixed(2));

  function handleApplyCoupon() {
    if (!couponCode.trim()) return;

    setIsApplyingCoupon(true);
    dispatch(applyCoupon({ code: couponCode.trim(), cartTotal: totalCartAmount }))
      .then((data) => {
        setIsApplyingCoupon(false);
        if (data?.payload?.success) {
          toast({ title: `Coupon "${data.payload.data.code}" applied!` });
        } else {
          toast({
            title: data?.payload?.message || "Invalid coupon code",
            variant: "destructive",
          });
        }
      })
      .catch(() => setIsApplyingCoupon(false));
  }

  function handleRemoveCoupon() {
    dispatch(resetCoupon());
    setCouponCode("");
  }

  function handleGenerateQr() {
    if (!cartItems?.items?.length) {
      toast({
        title: "Your cart is empty. Please add items to proceed",
        variant: "destructive",
      });
      return;
    }
    if (currentSelectedAddress === null) {
      toast({
        title: "Please select one address to proceed.",
        variant: "destructive",
      });
      return;
    }

    setIsCreatingOrder(true);

    const orderData = {
      userId: user?.id,
      cartId: cartItems?._id,
      cartItems: cartItems.items.map((singleCartItem) => ({
        productId: singleCartItem?.productId,
        title: singleCartItem?.title,
        image: singleCartItem?.image,
        price:
          singleCartItem?.salePrice > 0
            ? singleCartItem?.salePrice
            : singleCartItem?.price,
        quantity: singleCartItem?.quantity,
      })),
      addressInfo: {
        addressId: currentSelectedAddress?._id,
        address: currentSelectedAddress?.address,
        city: currentSelectedAddress?.city,
        pincode: currentSelectedAddress?.pincode,
        phone: currentSelectedAddress?.phone,
        notes: currentSelectedAddress?.notes,
      },
      orderStatus: "pending",
      paymentMethod: "UPI (QR)",
      paymentStatus: "pending",
      totalAmount: finalAmount,
      couponCode: appliedCoupon?.code || undefined,
      discountAmount: discountAmount || 0,
      orderDate: new Date(),
      orderUpdateDate: new Date(),
    };

    dispatch(createNewOrder(orderData)).then((data) => {
      setIsCreatingOrder(false);
      if (!data?.payload?.success) {
        toast({
          title: data?.payload?.message || "Could not create your order.",
          variant: "destructive",
        });
      }
    });
  }

  function handleConfirmPaid() {
    if (!currentPayment?.orderId) return;

    setIsSubmittingPayment(true);
    dispatch(
      markPaymentSubmitted({
        orderId: currentPayment.orderId,
        utrNumber: utrNumber.trim() || undefined,
      })
    ).then((data) => {
      setIsSubmittingPayment(false);
      if (data?.payload?.success) {
        dispatch(resetCoupon());
        dispatch(resetCurrentPayment());
        navigate("/shop/payment-success");
      } else {
        toast({
          title: data?.payload?.message || "Something went wrong.",
          variant: "destructive",
        });
      }
    });
  }

  return (
    <div className="flex flex-col">
      <div className="relative h-[300px] w-full overflow-hidden">
        <img src={img} className="h-full w-full object-cover object-center" />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mt-5 p-5">
        <Address
          selectedId={currentSelectedAddress}
          setCurrentSelectedAddress={setCurrentSelectedAddress}
        />
        <div className="flex flex-col gap-4">
          {cartItems && cartItems.items && cartItems.items.length > 0
            ? cartItems.items.map((item) => (
                <UserCartItemsContent cartItem={item} key={item?.productId} />
              ))
            : null}

          {!currentPayment ? (
            <>
              <div className="mt-4 border rounded-md p-4">
                <div className="flex items-center gap-2 font-medium mb-2">
                  <Tag className="w-4 h-4" /> Have a coupon?
                </div>
                {appliedCoupon ? (
                  <div className="flex items-center justify-between bg-green-50 text-green-700 px-3 py-2 rounded">
                    <span className="flex items-center gap-1 text-sm">
                      <BadgeCheck className="w-4 h-4" />
                      "{appliedCoupon.code}" applied — you saved ₹{discountAmount}
                    </span>
                    <X
                      className="w-4 h-4 cursor-pointer"
                      onClick={handleRemoveCoupon}
                    />
                  </div>
                ) : (
                  <div className="flex gap-2">
                    <Input
                      placeholder="Enter coupon code"
                      value={couponCode}
                      onChange={(e) =>
                        setCouponCode(e.target.value.toUpperCase())
                      }
                    />
                    <Button
                      variant="outline"
                      onClick={handleApplyCoupon}
                      disabled={isApplyingCoupon || !couponCode.trim()}
                    >
                      {isApplyingCoupon ? "Applying..." : "Apply"}
                    </Button>
                  </div>
                )}
                {couponError ? (
                  <p className="text-sm text-red-500 mt-1">{couponError}</p>
                ) : null}
              </div>

              <div className="mt-4 space-y-2">
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>Subtotal</span>
                  <span>₹{totalCartAmount}</span>
                </div>
                {discountAmount > 0 ? (
                  <div className="flex justify-between text-sm text-green-600">
                    <span>Discount</span>
                    <span>-₹{discountAmount}</span>
                  </div>
                ) : null}
                <div className="flex justify-between font-bold text-lg border-t pt-2">
                  <span>Total</span>
                  <span>₹{finalAmount}</span>
                </div>
              </div>
              <div className="mt-4 w-full">
                <Button onClick={handleGenerateQr} className="w-full">
                  {isCreatingOrder ? "Generating QR..." : "Pay with UPI"}
                </Button>
                <p className="text-xs text-muted-foreground text-center mt-2">
                  Scan the QR with any UPI app — GPay, PhonePe, Paytm, BHIM.
                </p>
              </div>
            </>
          ) : (
            <div className="mt-4 border rounded-md p-4 flex flex-col items-center gap-3">
              <div className="flex items-center gap-2 font-medium">
                <QrCode className="w-4 h-4" /> Scan to pay ₹{currentPayment.amount}
              </div>
              <img
                src={currentPayment.qrCodeDataUrl}
                alt="UPI QR code"
                className="w-56 h-56 border rounded-md"
              />
              <p className="text-sm text-muted-foreground text-center">
                Paying to <strong>{currentPayment.payeeName}</strong>
                <br />
                UPI ID: <strong>{currentPayment.upiId}</strong>
              </p>
              <a
                href={currentPayment.upiLink}
                className="w-full"
              >
                <Button variant="outline" className="w-full flex gap-2">
                  <ExternalLink className="w-4 h-4" /> Open in UPI app
                </Button>
              </a>

              <div className="w-full border-t pt-3 mt-2 space-y-2">
                <p className="text-sm font-medium">
                  Already paid? Enter your UPI transaction reference (UTR) so we
                  can verify it faster (optional).
                </p>
                <Input
                  placeholder="e.g. 123456789012"
                  value={utrNumber}
                  onChange={(e) => setUtrNumber(e.target.value)}
                />
                <Button
                  onClick={handleConfirmPaid}
                  disabled={isSubmittingPayment}
                  className="w-full"
                >
                  {isSubmittingPayment
                    ? "Submitting..."
                    : "I've completed the payment"}
                </Button>
                <p className="text-xs text-muted-foreground text-center">
                  We'll confirm your order once the payment is verified.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default ShoppingCheckout;
