import { configureStore } from "@reduxjs/toolkit";
import mediaReducer from "../slice/mediaSlice";
import settingsReducer from "../slice/settingSlice";

export const store = configureStore({
  reducer: {
    media: mediaReducer,
    settings: settingsReducer,
  },
});