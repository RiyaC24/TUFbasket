import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./authSlice";

import adminProductsSlice from "./admin/productsSlice";
import adminOrderSlice from "./admin/orderSlice";

import shopProductsSlice from "./shop/productsSlice";
import shopAddressSlice from "./shop/addressSlice";
import shopCartSlice from "./shop/cartSlice";
import shopOrderSlice from "./shop/orderSlice";
import shopSearchSlice from "./shop/searchSlice";
import shopReviewSlice from "./shop/reviewSlice";

import commonFeatureSlice from './commonSlice';


const store = configureStore({
  reducer: {
    auth: authReducer,

    adminProducts: adminProductsSlice,
    adminOrder: adminOrderSlice,

    shopProducts: shopProductsSlice,
    shopCart: shopCartSlice,
    shopAddress: shopAddressSlice,
    shopOrder: shopOrderSlice,
    shopSearch: shopSearchSlice,
    shopReview: shopReviewSlice,

    commonFeature: commonFeatureSlice,
  },
});

export default store;