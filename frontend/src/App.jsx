import "./App.css";
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import ModelViewer from "./components/ModelViewer";
import SettingsPanel from "./components/SettingsPanel";
import UploadSection from "./components/UploadSection";
import { fetchLatestMedia } from "./slice/mediaSlice";
import { fetchSettings, clearSettings } from "./slice/settingSlice";

function App() {
  const dispatch = useDispatch();
  const { mediaId } = useSelector((state) => state.media);

  useEffect(() => {
    dispatch(fetchLatestMedia());
  }, [dispatch]);

  useEffect(() => {
    if (mediaId) {
      dispatch(fetchSettings(mediaId));
    } else {
      dispatch(clearSettings());
    }
  }, [mediaId, dispatch]);

  return (
    <div>
      <h2>3D Model Viewer</h2>
      <UploadSection />
      <SettingsPanel />
      <ModelViewer />
    </div>
  );
}

export default App;
