import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";

const url = import.meta.env.VITE_BASE_URL;

const initialState = {
  isLoading: false,
  wishlistItems: [],
};

export const fetchWishlist = createAsyncThunk(
  "/wishlist/fetchWishlist",
  async (userId) => {
    const response = await axios.get(`${url}/api/shop/wishlist/${userId}`);
    return response?.data;
  }
);

export const addToWishlist = createAsyncThunk(
  "/wishlist/addToWishlist",
  async ({ userId, productId }) => {
    const response = await axios.post(`${url}/api/shop/wishlist/add`, {
      userId,
      productId,
    });
    return response?.data;
  }
);

export const removeFromWishlist = createAsyncThunk(
  "/wishlist/removeFromWishlist",
  async ({ userId, productId }) => {
    const response = await axios.delete(
      `${url}/api/shop/wishlist/${userId}/${productId}`
    );
    return response?.data;
  }
);

const wishlistSlice = createSlice({
  name: "shopWishlist",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchWishlist.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchWishlist.fulfilled, (state, action) => {
        state.isLoading = false;
        state.wishlistItems = action.payload?.data?.products || [];
      })
      .addCase(fetchWishlist.rejected, (state) => {
        state.isLoading = false;
      })
      .addCase(addToWishlist.fulfilled, (state, action) => {
        state.wishlistItems = action.payload?.data?.products || [];
      })
      .addCase(removeFromWishlist.fulfilled, (state, action) => {
        state.wishlistItems = action.payload?.data?.products || [];
      });
  },
});

export default wishlistSlice.reducer;
