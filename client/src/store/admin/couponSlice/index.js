import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";

const url = import.meta.env.VITE_BASE_URL;

const initialState = {
  isLoading: false,
  couponList: [],
};

export const addCoupon = createAsyncThunk(
  "/admin/coupon/add",
  async (formData, { rejectWithValue }) => {
    try {
      const response = await axios.post(`${url}/api/admin/coupons/add`, formData);
      return response?.data;
    } catch (error) {
      return rejectWithValue(
        error?.response?.data || { message: "Could not add coupon" }
      );
    }
  }
);

export const fetchAllCoupons = createAsyncThunk(
  "/admin/coupon/fetchAll",
  async () => {
    const response = await axios.get(`${url}/api/admin/coupons/list`);
    return response?.data;
  }
);

export const toggleCoupon = createAsyncThunk(
  "/admin/coupon/toggle",
  async (id) => {
    const response = await axios.put(`${url}/api/admin/coupons/toggle/${id}`);
    return response?.data;
  }
);

export const deleteCoupon = createAsyncThunk(
  "/admin/coupon/delete",
  async (id) => {
    const response = await axios.delete(`${url}/api/admin/coupons/${id}`);
    return { ...response?.data, id };
  }
);

const adminCouponSlice = createSlice({
  name: "adminCoupon",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchAllCoupons.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchAllCoupons.fulfilled, (state, action) => {
        state.isLoading = false;
        state.couponList = action.payload?.data || [];
      })
      .addCase(fetchAllCoupons.rejected, (state) => {
        state.isLoading = false;
        state.couponList = [];
      })
      .addCase(addCoupon.fulfilled, (state, action) => {
        if (action.payload?.data) state.couponList.unshift(action.payload.data);
      })
      .addCase(toggleCoupon.fulfilled, (state, action) => {
        const updated = action.payload?.data;
        if (updated) {
          state.couponList = state.couponList.map((c) =>
            c._id === updated._id ? updated : c
          );
        }
      })
      .addCase(deleteCoupon.fulfilled, (state, action) => {
        state.couponList = state.couponList.filter(
          (c) => c._id !== action.payload.id
        );
      });
  },
});

export default adminCouponSlice.reducer;
