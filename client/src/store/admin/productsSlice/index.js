import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";

const url = import.meta.env.VITE_BASE_URL;

const initialState = {
  isLoading: false,
  productList: [],
};

export const addNewProduct = createAsyncThunk(
  "/products/add",
  async (formData) => {
    const result = await axios.post(`${url}/api/admin/products/add`, formData, {
      headers: {
        "Content-Type": "application/json",
      },
    });

    return result?.data;
  }
);

export const fetchAllProducts = createAsyncThunk(
  "/products/fetchAllProducts",
  async () => {
    const result = await axios.get(`${url}/api/admin/products/get`);

    return result?.data;
  }
);

export const editProduct = createAsyncThunk(
  "/products/edit",
  async ({ id, formData }) => {
    const result = await axios.put(
      `${url}/api/admin/products/edit/${id}`,
      formData,
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    return result?.data
  }
);

export const deleteProduct = createAsyncThunk(
    '/products/delete',
    async (id) => {
        const result = await axios.delete(
            `${url}/api/admin/products/delete/${id}`
        );

        return result?.data;
    }
);

const AdminProductsSlice = createSlice({
    name: "AdminProducts",
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
           .addCase(fetchAllProducts.pending, (state) => {
            state.isLoading = true;
           })
           .addCase(fetchAllProducts.fulfilled, (state, action) => {
            state.isLoading = false;
            state.productList = action.payload.data;
           })
           .addCase(fetchAllProducts.rejected, (state) => {
            state.isLoading = false
            state.productList = [];
           })
    }
});

export default AdminProductsSlice.reducer;
