import { Card, CardContent, CardFooter } from "../ui/Card";
import { Button } from "../ui/Button";
import { brandOptionsMap, categoryOptionsMap } from "@/config";
import { Badge } from "../ui/Badge";
import { Heart } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { addToWishlist, removeFromWishlist } from "@/store/shop/wishlistSlice";
import { useToast } from "../ui/UseToast";

function ShoppingProductTile({
  product,
  handleGetProductDetails,
  handleAddtoCart,
}) {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { wishlistItems } = useSelector((state) => state.shopWishlist);
  const { toast } = useToast();

  const isWishlisted = wishlistItems?.some(
    (item) => item?._id === product?._id
  );

  function handleToggleWishlist(e) {
    e.stopPropagation();

    if (!user?.id) {
      toast({ title: "Please login to use your wishlist" });
      return;
    }

    if (isWishlisted) {
      dispatch(removeFromWishlist({ userId: user.id, productId: product._id }));
    } else {
      dispatch(addToWishlist({ userId: user.id, productId: product._id })).then(
        (data) => {
          if (data?.payload?.success) {
            toast({ title: "Added to wishlist" });
          }
        }
      );
    }
  }

  return (
    <Card className="w-full max-w-sm mx-auto">
      <div onClick={() => handleGetProductDetails(product?._id)}>
        <div className="relative">
          <img
            src={product?.image}
            alt={product?.title}
            className="w-full h-[300px] object-cover rounded-t-lg"
          />
          <button
            onClick={handleToggleWishlist}
            className="absolute top-2 right-2 bg-white/90 rounded-full p-2 shadow hover:bg-white"
          >
            <Heart
              className={`w-5 h-5 ${
                isWishlisted ? "fill-red-500 text-red-500" : "text-gray-600"
              }`}
            />
          </button>
          {product?.totalStock === 0 ? (
            <Badge className="absolute top-2 left-2 bg-red-500 hover:bg-red-600">
              Out Of Stock
            </Badge>
          ) : product?.totalStock < 10 ? (
            <Badge className="absolute top-2 left-2 bg-red-500 hover:bg-red-600">
              {`Only ${product?.totalStock} items left`}
            </Badge>
         
          ) : null}
        </div>
        <CardContent className="p-4">
          <h2 className="text-xl font-bold mb-2">{product?.title}</h2>
          <div className="flex justify-between items-center mb-2">
            <span className="text-[16px] text-muted-foreground">
              {categoryOptionsMap[product?.category]}
            </span>
            <span className="text-[16px] text-muted-foreground">
              {brandOptionsMap[product?.brand]}
            </span>
          </div>
          <div className="flex justify-between items-center mb-2">
            <span
              className={`${
                product?.salePrice > 0 ? "line-through" : ""
              } text-lg font-semibold text-primary`}
            >
              ₹{product?.price}
            </span>
            {product?.salePrice > 0 ? (
              <span className="text-lg font-semibold text-primary">
                ₹{product?.salePrice}
              </span>
            ) : null}
          </div>
        </CardContent>
      </div>
      <CardFooter>
        {product?.totalStock === 0 ? (
          <Button className="w-full opacity-60 cursor-not-allowed">
            Out Of Stock
          </Button>
        ) : (
          <Button
            onClick={() => handleAddtoCart(product?._id, product?.totalStock)}
            className="w-full"
          >
            Add to cart
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}

export default ShoppingProductTile;
