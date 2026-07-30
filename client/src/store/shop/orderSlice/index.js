import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";

const url = import.meta.env.VITE_BASE_URL;

const initialState = {
  isLoading: false,
  currentPayment: null, // { orderId, amount, upiLink, qrCodeDataUrl, upiId, payeeName }
  orderId: null,
  orderList: [],
  orderDetails: null,
  appliedCoupon: null,
  couponError: null,
};

export const createNewOrder = createAsyncThunk(
  "/order/createNewOrder",
  async (orderData) => {
    const response = await axios.post(
      `${url}/api/shop/order/create`,
      orderData
    );

    return response?.data;
  }
);

export const markPaymentSubmitted = createAsyncThunk(
  "/order/markPaymentSubmitted",
  async ({ orderId, utrNumber }) => {
    const response = await axios.post(`${url}/api/shop/order/mark-paid`, {
      orderId,
      utrNumber,
    });

    return response?.data;
  }
);

export const applyCoupon = createAsyncThunk(
  "/order/applyCoupon",
  async ({ code, cartTotal }, { rejectWithValue }) => {
    try {
      const response = await axios.post(`${url}/api/shop/coupon/apply`, {
        code,
        cartTotal,
      });

      return response?.data;
    } catch (error) {
      return rejectWithValue(
        error?.response?.data || { message: "Could not apply coupon" }
      );
    }
  }
);

export const getAllOrdersByUserId = createAsyncThunk(
  "/order/getAllOrdersByUserId",
  async (userId) => {
    const response = await axios.get(`${url}/api/shop/order/list/${userId}`);

    return response?.data;
  }
);

export const getOrderDetails = createAsyncThunk(
  "/order/getOrderDetails",
  async (id) => {
    const response = await axios.get(`${url}/api/shop/order/details/${id}`);

    return response?.data;
  }
);

const shoppingOrderSlice = createSlice({
  name: "shoppingOrderSlice",
  initialState,
  reducers: {
    resetOrderDetails: (state) => {
      state.orderDetails = null;
    },
    resetCoupon: (state) => {
      state.appliedCoupon = null;
      state.couponError = null;
    },
    resetCurrentPayment: (state) => {
      state.currentPayment = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(createNewOrder.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(createNewOrder.fulfilled, (state, action) => {
        state.isLoading = false;
        if (action.payload?.success) {
          state.currentPayment = {
            orderId: action.payload.orderId,
            amount: action.payload.amount,
            upiLink: action.payload.upiLink,
            qrCodeDataUrl: action.payload.qrCodeDataUrl,
            upiId: action.payload.upiId,
            payeeName: action.payload.payeeName,
          };
          state.orderId = action.payload.orderId;
          sessionStorage.setItem(
            "currentOrderId",
            JSON.stringify(action.payload.orderId)
          );
        }
      })
      .addCase(createNewOrder.rejected, (state) => {
        state.isLoading = false;
        state.currentPayment = null;
        state.orderId = null;
      })
      .addCase(applyCoupon.pending, (state) => {
        state.couponError = null;
      })
      .addCase(applyCoupon.fulfilled, (state, action) => {
        state.appliedCoupon = action.payload.data;
        state.couponError = null;
      })
      .addCase(applyCoupon.rejected, (state, action) => {
        state.appliedCoupon = null;
        state.couponError =
          action.payload?.message || "Could not apply coupon";
      })
      .addCase(getAllOrdersByUserId.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getAllOrdersByUserId.fulfilled, (state, action) => {
        state.isLoading = false;
        state.orderList = action.payload.data;
      })
      .addCase(getAllOrdersByUserId.rejected, (state) => {
        state.isLoading = false;
        state.orderList = [];
      })
      .addCase(getOrderDetails.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getOrderDetails.fulfilled, (state, action) => {
        state.isLoading = false;
        state.orderDetails = action.payload.data;
      })
      .addCase(getOrderDetails.rejected, (state) => {
        state.isLoading = false;
        state.orderDetails = null;
      });
  },
});

export const { resetOrderDetails, resetCoupon, resetCurrentPayment } =
  shoppingOrderSlice.actions;

export default shoppingOrderSlice.reducer;
