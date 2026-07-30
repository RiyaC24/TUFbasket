import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";

const url = import.meta.env.VITE_BASE_URL;

const initialState = {
  isLoading: false,
  reviews: [],
  error: null,
};

export const addReview = createAsyncThunk(
  "review/addReview",
  async (formdata, { rejectWithValue }) => {
    try {
      const response = await axios.post(`${url}/api/shop/review/add`, formdata);
      return response.data; // { success, message, data }
    } catch (err) {
      return rejectWithValue(
        err.response?.data || {
          success: false,
          message: "Something went wrong",
        }
      );
    }
  }
);

export const getReviews = createAsyncThunk(
  "review/getReviews",
  async (id, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${url}/api/shop/review/${id}`);
      return response.data; // { success, data }
    } catch (err) {
      return rejectWithValue(
        err.response?.data || {
          success: false,
          message: "Something went wrong",
        }
      );
    }
  }
);

const reviewSlice = createSlice({
  name: "reviewSlice",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(getReviews.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getReviews.fulfilled, (state, action) => {
        state.isLoading = false;
        state.reviews = action.payload?.data || [];
        state.error = null;
      })
      .addCase(getReviews.rejected, (state, action) => {
        state.isLoading = false;
        state.reviews = [];
        state.error = action.payload?.message || "Failed to fetch reviews";
      })
      .addCase(addReview.fulfilled, (state, action) => {
        if (action.payload?.success) {
          state.reviews.push(action.payload.data); // add new review to state
          state.error = null;
        } else {
          state.error = action.payload?.message || "Failed to add review";
        }
      })
      .addCase(addReview.rejected, (state, action) => {
        state.error = action.payload?.message || "Failed to add review";
      });
  },
});

export default reviewSlice.reducer;
