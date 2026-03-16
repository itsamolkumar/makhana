import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

export const createProduct = createAsyncThunk(
  "products/create",
  async (data: any) => {
    const res = await axios.post("/api/admin/products", data);
    return res.data;
  }
);

const initialState = {
  products: [],
  loading: false,
  success: false,
};

const productSlice = createSlice({
  name: "products",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder.addCase(createProduct.pending, (state) => {
      state.loading = true;
    });
    builder.addCase(createProduct.fulfilled, (state) => {
      state.loading = false;
      state.success = true;
    });
    builder.addCase(createProduct.rejected, (state) => {
      state.loading = false;
    });
  },
});

export default productSlice.reducer;