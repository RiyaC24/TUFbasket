import { useState } from "react";
import CommonForm from "../common/Form";
import { DialogContent } from "../ui/Dialog";
import { Label } from "../ui/Label";
import { Separator } from "../ui/Separator";
import { Badge } from "../ui/Badge";
import { Button } from "../ui/Button";
import { useDispatch, useSelector } from "react-redux";
import {
  getAllOrdersForAdmin,
  getOrderDetailsForAdmin,
  updateOrderStatus,
  verifyOrderPayment,
  rejectOrderPayment,
} from "@/store/admin/orderSlice";
import { useToast } from "../ui/UseToast";
import { CheckCircle2, XCircle } from "lucide-react";

const initialFormData = {
  status: "",
};

function AdminOrderDetailsView({ orderDetails }) {
  const [formData, setFormData] = useState(initialFormData);
  const [isVerifying, setIsVerifying] = useState(false);
  const { user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const { toast } = useToast();

  function handleUpdateStatus(event) {
    event.preventDefault();
    const { status } = formData;

    dispatch(
      updateOrderStatus({ id: orderDetails?._id, orderStatus: status })
    ).then((data) => {
      if (data?.payload?.success) {
        dispatch(getOrderDetailsForAdmin(orderDetails?._id));
        dispatch(getAllOrdersForAdmin());
        setFormData(initialFormData);
        toast({
          title: data?.payload?.message,
        });
      }
    });
  }

  function handleVerifyPayment() {
    setIsVerifying(true);
    dispatch(verifyOrderPayment(orderDetails?._id)).then((data) => {
      setIsVerifying(false);
      if (data?.payload?.success) {
        dispatch(getOrderDetailsForAdmin(orderDetails?._id));
        dispatch(getAllOrdersForAdmin());
        toast({ title: data?.payload?.message });
      } else {
        toast({
          title: data?.payload?.message || "Could not verify payment",
          variant: "destructive",
        });
      }
    });
  }

  function handleRejectPayment() {
    setIsVerifying(true);
    dispatch(rejectOrderPayment(orderDetails?._id)).then((data) => {
      setIsVerifying(false);
      if (data?.payload?.success) {
        dispatch(getOrderDetailsForAdmin(orderDetails?._id));
        dispatch(getAllOrdersForAdmin());
        toast({ title: data?.payload?.message });
      }
    });
  }

  return (
    <DialogContent className="sm:max-w-[600px] bg-gray-200 text-black">
      <div className="grid gap-6">
        <div className="grid gap-2">
          <div className="flex mt-6 items-center justify-between">
            <p className="font-medium">Order ID</p>
            <Label>{orderDetails?._id}</Label>
          </div>
          <div className="flex mt-2 items-center justify-between">
            <p className="font-medium">Order Date</p>
            <Label>{orderDetails?.orderDate.split("T")[0]}</Label>
          </div>
          <div className="flex mt-2 items-center justify-between">
            <p className="font-medium">Order Price</p>
            <Label>₹{orderDetails?.totalAmount}</Label>
          </div>
          {orderDetails?.discountAmount > 0 ? (
            <div className="flex mt-2 items-center justify-between">
              <p className="font-medium">Coupon Applied</p>
              <Label>
                {orderDetails?.couponCode} (-₹{orderDetails?.discountAmount})
              </Label>
            </div>
          ) : null}
          <div className="flex mt-2 items-center justify-between">
            <p className="font-medium">Payment method</p>
            <Label>{orderDetails?.paymentMethod}</Label>
          </div>
          {orderDetails?.utrNumber ? (
            <div className="flex mt-2 items-center justify-between">
              <p className="font-medium">UTR / Ref. Number</p>
              <Label>{orderDetails?.utrNumber}</Label>
            </div>
          ) : null}
          <div className="flex mt-2 items-center justify-between">
            <p className="font-medium">Payment Status</p>
            <Label>
              <Badge
                className={`py-1 px-3 ${
                  orderDetails?.paymentStatus === "paid"
                    ? "bg-green-500"
                    : orderDetails?.paymentStatus === "failed"
                    ? "bg-red-600"
                    : orderDetails?.paymentStatus === "pending-verification"
                    ? "bg-yellow-500"
                    : "bg-gray-400"
                }`}
              >
                {orderDetails?.paymentStatus}
              </Badge>
            </Label>
          </div>
          <div className="flex mt-2 items-center justify-between">
            <p className="font-medium">Order Status</p>
            <Label>
              <Badge
                className={`py-1 px-3 ${
                  orderDetails?.orderStatus === "delivered"
                    ? "bg-green-500"
                    : orderDetails?.orderStatus === "rejected"
                    ? "bg-red-600"
                    : "bg-black"
                }`}
              >
                {orderDetails?.orderStatus}
              </Badge>
            </Label>
          </div>
        </div>

        {orderDetails?.paymentStatus !== "paid" ? (
          <div className="flex gap-2">
            <Button
              onClick={handleVerifyPayment}
              disabled={isVerifying}
              className="w-full flex gap-2 bg-green-600 hover:bg-green-700"
            >
              <CheckCircle2 className="w-4 h-4" /> Verify Payment
            </Button>
            <Button
              onClick={handleRejectPayment}
              disabled={isVerifying}
              variant="outline"
              className="w-full flex gap-2 text-red-600 border-red-600"
            >
              <XCircle className="w-4 h-4" /> Reject Payment
            </Button>
          </div>
        ) : null}

        <Separator />
        <div className="grid gap-4">
          <div className="grid gap-2">
            <div className="font-medium">Order Details</div>
            <ul className="grid gap-3">
              {orderDetails?.cartItems && orderDetails?.cartItems.length > 0
                ? orderDetails?.cartItems.map((item, i) => (
                    <li key={i} className="flex items-center justify-between">
                      <span>Title: {item.title}</span>
                      <span>Quantity: {item.quantity}</span>
                      <span>Price: ₹{item.price}</span>
                    </li>
                  ))
                : null}
            </ul>
          </div>
        </div>
        <div className="grid gap-4">
          <div className="grid gap-2">
            <div className="font-medium">Shipping Info</div>
            <div className="grid gap-0.5 text-muted-foreground">
              <span>{user.userName}</span>
              <span>{orderDetails?.addressInfo?.address}</span>
              <span>{orderDetails?.addressInfo?.city}</span>
              <span>{orderDetails?.addressInfo?.pincode}</span>
              <span>{orderDetails?.addressInfo?.phone}</span>
              <span>{orderDetails?.addressInfo?.notes}</span>
            </div>
          </div>
        </div>

        <div>
          <CommonForm
            formControls={[
              {
                label: "Order Status",
                name: "status",
                componentType: "select",
                options: [
                  { id: "pending", label: "Pending" },
                  { id: "inProcess", label: "In Process" },
                  { id: "inShipping", label: "In Shipping" },
                  { id: "delivered", label: "Delivered" },
                  { id: "rejected", label: "Rejected" },
                ],
              },
            ]}
            formData={formData}
            setFormData={setFormData}
            buttonText={"Update Order Status"}
            onSubmit={handleUpdateStatus}
          />
        </div>
      </div>
    </DialogContent>
  );
}

export default AdminOrderDetailsView;
