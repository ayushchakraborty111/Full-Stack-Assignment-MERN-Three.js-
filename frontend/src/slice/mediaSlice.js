import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

export const uploadModel = createAsyncThunk(
  "media/upload",
  async (file) => {
    const formData = new FormData();
    formData.append("model", file);

    const response = await axios.post(
      `${import.meta.env.VITE_BACKEND_URL}/media/upload`,
      formData
    );

    return response.data;
  }
);

export const deleteModel = createAsyncThunk(
  "media/delete",
  async (mediaId) => {
    const response = await axios.delete(
      `${import.meta.env.VITE_BACKEND_URL}/media/${mediaId}`
    );

    return response.data;
  }
);

export const fetchLatestMedia = createAsyncThunk(
  "media/fetchLatest",
  async () => {
    const response = await axios.get(
      `${import.meta.env.VITE_BACKEND_URL}/media/latest`
    );

    return response.data;
  },
  {
    condition: (_, { getState }) => {
      const state = getState();
      if (state.media.modelUrl) {
        return false;
      }
    },
  }
);

const mediaSlice = createSlice({
  name: "media",
  initialState: {
    modelUrl: null,
    mediaId: null,
    isLoading: false,
    isDeleting: false,
    error: null,
  },
  reducers: {
    clearMedia: (state) => {
      state.modelUrl = null;
      state.mediaId = null;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(uploadModel.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(uploadModel.fulfilled, (state, action) => {
        state.isLoading = false;
        state.modelUrl = action.payload.file_url;
        state.mediaId = action.payload.media_id;
        state.error = null;
      })
      .addCase(uploadModel.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || "Upload failed";
      })
      .addCase(deleteModel.pending, (state) => {
        state.isDeleting = true;
        state.error = null;
      })
      .addCase(deleteModel.fulfilled, (state) => {
        state.isDeleting = false;
        state.modelUrl = null;
        state.mediaId = null;
        state.error = null;
      })
      .addCase(deleteModel.rejected, (state, action) => {
        state.isDeleting = false;
        state.error = action.error.message || "Delete failed";
      })
      .addCase(fetchLatestMedia.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchLatestMedia.fulfilled, (state, action) => {
        state.isLoading = false;
        // Access the nested data object from backend response
        if (action.payload.data) {
          state.modelUrl = action.payload.data.media_url;
          state.mediaId = action.payload.data._id;
        } else if (action.payload.media_url) {
          // Fallback for direct data response
          state.modelUrl = action.payload.media_url;
          state.mediaId = action.payload._id;
        }
        state.error = null;
      })
      .addCase(fetchLatestMedia.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || "Failed to fetch media";
      });
  },
});

export const { clearMedia } = mediaSlice.actions;
export default mediaSlice.reducer;