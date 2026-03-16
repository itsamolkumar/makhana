import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  stats: null,
  salesGraph: [],
  loading: false,
};

const dashboardSlice = createSlice({
  name: "dashboard",
  initialState,
  reducers: {
    setStats: (state, action) => {
      state.stats = action.payload;
    },
    setSalesGraph: (state, action) => {
      state.salesGraph = action.payload;
    },
  },
});

export const { setStats, setSalesGraph } = dashboardSlice.actions;
export default dashboardSlice.reducer;