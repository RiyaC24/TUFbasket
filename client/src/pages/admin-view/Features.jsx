import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/Table";
import { useToast } from "@/components/ui/UseToast";
import {
  addCoupon,
  deleteCoupon,
  fetchAllCoupons,
  toggleCoupon,
} from "@/store/admin/couponSlice";
import { Trash2, Ticket } from "lucide-react";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";

const initialFormData = {
  code: "",
  discountType: "percentage",
  discountValue: "",
  minOrderAmount: "",
  maxDiscountAmount: "",
  expiryDate: "",
  usageLimit: "",
};

const AdminFeatures = () => {
  const dispatch = useDispatch();
  const { couponList, isLoading } = useSelector((state) => state.adminCoupon);
  const [formData, setFormData] = useState(initialFormData);
  const { toast } = useToast();

  useEffect(() => {
    dispatch(fetchAllCoupons());
  }, [dispatch]);

  function handleSubmit(e) {
    e.preventDefault();

    if (!formData.code || !formData.discountValue) {
      toast({
        title: "Coupon code and discount value are required",
        variant: "destructive",
      });
      return;
    }

    dispatch(
      addCoupon({
        ...formData,
        discountValue: Number(formData.discountValue),
        minOrderAmount: formData.minOrderAmount
          ? Number(formData.minOrderAmount)
          : undefined,
        maxDiscountAmount: formData.maxDiscountAmount
          ? Number(formData.maxDiscountAmount)
          : undefined,
        usageLimit: formData.usageLimit ? Number(formData.usageLimit) : undefined,
        expiryDate: formData.expiryDate || undefined,
      })
    ).then((data) => {
      if (data?.payload?.success) {
        toast({ title: "Coupon created successfully" });
        setFormData(initialFormData);
      } else {
        toast({
          title: data?.payload?.message || "Could not create coupon",
          variant: "destructive",
        });
      }
    });
  }

  return (
    <div className="p-4 md:p-6 flex flex-col gap-8">
      <div>
        <h2 className="text-2xl font-extrabold mb-4 flex items-center gap-2">
          <Ticket className="w-6 h-6" /> Coupons
        </h2>
        <form
          onSubmit={handleSubmit}
          className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-4 gap-4 border rounded-md p-4"
        >
          <div>
            <Label>Code</Label>
            <Input
              value={formData.code}
              onChange={(e) =>
                setFormData({ ...formData, code: e.target.value.toUpperCase() })
              }
              placeholder="SAVE10"
            />
          </div>
          <div>
            <Label>Discount Type</Label>
            <select
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              value={formData.discountType}
              onChange={(e) =>
                setFormData({ ...formData, discountType: e.target.value })
              }
            >
              <option value="percentage">Percentage (%)</option>
              <option value="flat">Flat (₹)</option>
            </select>
          </div>
          <div>
            <Label>Discount Value</Label>
            <Input
              type="number"
              value={formData.discountValue}
              onChange={(e) =>
                setFormData({ ...formData, discountValue: e.target.value })
              }
              placeholder="10"
            />
          </div>
          <div>
            <Label>Min Order Amount</Label>
            <Input
              type="number"
              value={formData.minOrderAmount}
              onChange={(e) =>
                setFormData({ ...formData, minOrderAmount: e.target.value })
              }
              placeholder="Optional"
            />
          </div>
          <div>
            <Label>Max Discount Cap</Label>
            <Input
              type="number"
              value={formData.maxDiscountAmount}
              onChange={(e) =>
                setFormData({ ...formData, maxDiscountAmount: e.target.value })
              }
              placeholder="Optional"
            />
          </div>
          <div>
            <Label>Expiry Date</Label>
            <Input
              type="date"
              value={formData.expiryDate}
              onChange={(e) =>
                setFormData({ ...formData, expiryDate: e.target.value })
              }
            />
          </div>
          <div>
            <Label>Usage Limit</Label>
            <Input
              type="number"
              value={formData.usageLimit}
              onChange={(e) =>
                setFormData({ ...formData, usageLimit: e.target.value })
              }
              placeholder="Optional"
            />
          </div>
          <div className="flex items-end">
            <Button type="submit" className="w-full">
              Create Coupon
            </Button>
          </div>
        </form>
      </div>

      <div>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Code</TableHead>
              <TableHead>Discount</TableHead>
              <TableHead>Min Order</TableHead>
              <TableHead>Used</TableHead>
              <TableHead>Expiry</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {!isLoading && couponList?.length
              ? couponList.map((coupon) => (
                  <TableRow key={coupon._id}>
                    <TableCell className="font-semibold">
                      {coupon.code}
                    </TableCell>
                    <TableCell>
                      {coupon.discountType === "percentage"
                        ? `${coupon.discountValue}%`
                        : `₹${coupon.discountValue}`}
                    </TableCell>
                    <TableCell>
                      {coupon.minOrderAmount ? `₹${coupon.minOrderAmount}` : "-"}
                    </TableCell>
                    <TableCell>
                      {coupon.usedCount}
                      {coupon.usageLimit ? ` / ${coupon.usageLimit}` : ""}
                    </TableCell>
                    <TableCell>
                      {coupon.expiryDate
                        ? new Date(coupon.expiryDate).toLocaleDateString()
                        : "-"}
                    </TableCell>
                    <TableCell>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => dispatch(toggleCoupon(coupon._id))}
                      >
                        {coupon.isActive ? "Active" : "Inactive"}
                      </Button>
                    </TableCell>
                    <TableCell>
                      <Trash2
                        className="w-4 h-4 cursor-pointer text-red-500"
                        onClick={() => dispatch(deleteCoupon(coupon._id))}
                      />
                    </TableCell>
                  </TableRow>
                ))
              : null}
          </TableBody>
        </Table>
        {!isLoading && !couponList?.length ? (
          <p className="text-muted-foreground p-4">No coupons yet.</p>
        ) : null}
      </div>
    </div>
  );
};

export default AdminFeatures;
