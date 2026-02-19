import { useDispatch, useSelector } from "react-redux";
import {
  saveSettings,
  setLocalSettings,
} from "../slice/settingSlice";

export default function SettingsPanel() {
  const dispatch = useDispatch();
  const { backgroundColor, wireframe_mode } = useSelector(
    (state) => state.settings
  );
  const { mediaId } = useSelector((state) => state.media);

  const handleSave = () => {
    dispatch(
      saveSettings({
        media_id: mediaId,
        backgroundColor,
        wireframe_mode,
      })
    );
  };

  return (
    <div>
      <input
        type="color"
        value={backgroundColor}
        onChange={(e) =>
          dispatch(
            setLocalSettings({
              backgroundColor: e.target.value,
              wireframe_mode,
            })
          )
        }
      />

      <label>
        <input
          type="checkbox"
          checked={wireframe_mode}
          onChange={(e) =>
            dispatch(
              setLocalSettings({
                backgroundColor,
                wireframe_mode: e.target.checked,
              })
            )
          }
        />
        Wireframe
      </label>

      <button onClick={handleSave}>Save Settings</button>
    </div>
  );
}