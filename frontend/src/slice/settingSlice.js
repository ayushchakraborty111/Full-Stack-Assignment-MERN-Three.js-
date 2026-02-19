import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

export const saveSettings = createAsyncThunk(
  "settings/save",
  async (data) => {
    const response = await axios.post(
      `${import.meta.env.VITE_BACKEND_URL}/settings`,
      data
    );
    return response.data;
  }
);

export const fetchSettings = createAsyncThunk(
  "settings/fetch",
  async (mediaId) => {
    const response = await axios.get(
      `${import.meta.env.VITE_BACKEND_URL}/settings/${mediaId}`
    );
    return response.data;
  }
);

const settingsSlice = createSlice({
  name: "settings",
  initialState: {
    backgroundColor: "#ffffff",
    wireframe_mode: false,
  },
  reducers: {
    setLocalSettings: (state, action) => {
      state.backgroundColor = action.payload.backgroundColor;
      state.wireframe_mode = action.payload.wireframe_mode;
    },
  },
  extraReducers: (builder) => {
    builder.addCase(saveSettings.fulfilled, (state, action) => {
      state.backgroundColor = action.payload.data.backgroundColor;
      state.wireframe_mode = action.payload.data.wireframe_mode;
    });
    builder.addCase(fetchSettings.fulfilled, (state, action) => {
      if (action.payload.length > 0) {
        const latest = action.payload[0];
        state.backgroundColor = latest.backgroundColor;
        state.wireframe_mode = latest.wireframe_mode;
      }
    });
  },
});

export const { setLocalSettings } = settingsSlice.actions;
export default settingsSlice.reducer;