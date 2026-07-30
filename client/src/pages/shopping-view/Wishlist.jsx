import ShoppingProductTile from "@/components/shopping-view/ProductTile";
import ProductDetailsDialog from "@/components/shopping-view/ProductDetails";
import { useToast } from "@/components/ui/UseToast";
import { addToCart, fetchCartItems } from "@/store/shop/cartSlice";
import { fetchProductDetails } from "@/store/shop/productsSlice";
import { fetchWishlist } from "@/store/shop/wishlistSlice";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Heart } from "lucide-react";

function Wishlist() {
  const dispatch = useDispatch();
  const { wishlistItems, isLoading } = useSelector(
    (state) => state.shopWishlist
  );
  const { cartItems } = useSelector((state) => state.shopCart);
  const { user } = useSelector((state) => state.auth);
  const { productDetails } = useSelector((state) => state.shopProducts);
  const [openDetailsDialog, setOpenDetailsDialog] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (user?.id) dispatch(fetchWishlist(user.id));
  }, [dispatch, user?.id]);

  useEffect(() => {
    if (productDetails !== null) setOpenDetailsDialog(true);
  }, [productDetails]);

  function handleGetProductDetails(id) {
    dispatch(fetchProductDetails(id));
  }

  function handleAddtoCart(getCurrentProductId, getTotalStock) {
    let getCartItems = cartItems.items || [];

    if (getCartItems.length) {
      const indexOfCurrentItem = getCartItems.findIndex(
        (item) => item.productId === getCurrentProductId
      );
      if (indexOfCurrentItem > -1) {
        const getQuantity = getCartItems[indexOfCurrentItem].quantity;
        if (getQuantity + 1 > getTotalStock) {
          toast({
            title: `Only ${getQuantity} quantity can be added for this item`,
            variant: "destructive",
          });
          return;
        }
      }
    }

    dispatch(
      addToCart({ userId: user?.id, productId: getCurrentProductId, quantity: 1 })
    ).then((data) => {
      if (data?.payload?.success) {
        dispatch(fetchCartItems(user?.id));
        toast({ title: "Product is added to cart" });
      }
    });
  }

  return (
    <div className="p-4 md:p-6">
      <h2 className="text-2xl font-extrabold mb-6 flex items-center gap-2">
        <Heart className="w-6 h-6" /> My Wishlist
      </h2>
      {isLoading ? (
        <p className="text-muted-foreground">Loading...</p>
      ) : wishlistItems && wishlistItems.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {wishlistItems.map((product) => (
            <ShoppingProductTile
              key={product?._id}
              product={product}
              handleGetProductDetails={handleGetProductDetails}
              handleAddtoCart={handleAddtoCart}
            />
          ))}
        </div>
      ) : (
        <p className="text-muted-foreground">
          Your wishlist is empty. Tap the heart icon on any product to save it
          here.
        </p>
      )}
      <ProductDetailsDialog
        open={openDetailsDialog}
        setOpen={setOpenDetailsDialog}
        productDetails={productDetails}
      />
    </div>
  );
}

export default Wishlist;
