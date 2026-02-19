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
    material_type: "standard",
    hdri_preset: "sunset",
    isLoading: false,
    isSaving: false,
    error: null,
  },
  reducers: {
    setLocalSettings: (state, action) => {
      state.backgroundColor = action.payload.backgroundColor;
      state.wireframe_mode = action.payload.wireframe_mode;
      if (action.payload.material_type !== undefined) {
        state.material_type = action.payload.material_type;
      }
      if (action.payload.hdri_preset !== undefined) {
        state.hdri_preset = action.payload.hdri_preset;
      }
      state.error = null;
    },
    clearSettings: (state) => {
      state.backgroundColor = "#ffffff";
      state.wireframe_mode = false;
      state.material_type = "standard";
      state.hdri_preset = "sunset";
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(saveSettings.pending, (state) => {
        state.isSaving = true;
        state.error = null;
      })
      .addCase(saveSettings.fulfilled, (state, action) => {
        state.isSaving = false;
        state.backgroundColor = action.payload.data.backgroundColor;
        state.wireframe_mode = action.payload.data.wireframe_mode;
        state.material_type = action.payload.data.material_type || state.material_type;
        state.hdri_preset = action.payload.data.hdri_preset || state.hdri_preset;
        state.error = null;
      })
      .addCase(saveSettings.rejected, (state, action) => {
        state.isSaving = false;
        state.error = action.error.message || "Failed to save settings";
      })
      .addCase(fetchSettings.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchSettings.fulfilled, (state, action) => {
        state.isLoading = false;
        const settingsData = action.payload.data || action.payload;
        if (Array.isArray(settingsData) && settingsData.length > 0) {
          const latest = settingsData[0];
          state.backgroundColor = latest.backgroundColor;
          state.wireframe_mode = latest.wireframe_mode;
          state.material_type = latest.material_type || "standard";
          state.hdri_preset = latest.hdri_preset || "sunset";
        } else {
          state.backgroundColor = "#ffffff";
          state.wireframe_mode = false;
          state.material_type = "standard";
          state.hdri_preset = "sunset";
        }
        state.error = null;
      })
      .addCase(fetchSettings.rejected, (state, action) => {
        state.isLoading = false;
        state.error = null;
      });
  },
});

export const { setLocalSettings, clearSettings } = settingsSlice.actions;
export default settingsSlice.reducer;