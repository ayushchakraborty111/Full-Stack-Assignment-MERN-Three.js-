import { useDispatch, useSelector } from "react-redux";
import {
  saveSettings,
  setLocalSettings,
} from "../slice/settingSlice";

const MATERIAL_TYPES = [
  { value: "standard", label: "Standard" },
  { value: "metallic", label: "Metallic" },
  { value: "plastic", label: "Plastic" },
  { value: "leather", label: "Leather" },
];

const HDRI_PRESETS = [
  "sunset",
  "dawn",
  "night",
  "warehouse",
  "forest",
  "apartment",
  "studio",
  "city",
];

export default function SettingsPanel() {
  const dispatch = useDispatch();
  const { backgroundColor, wireframe_mode, material_type, hdri_preset } = useSelector(
    (state) => state.settings
  );
  const { mediaId } = useSelector((state) => state.media);

  const handleSave = () => {
    dispatch(
      saveSettings({
        media_id: mediaId,
        backgroundColor,
        wireframe_mode,
        material_type,
        hdri_preset,
      })
    );
  };

  return (
    <div style={{ padding: "20px", border: "1px solid #ccc", borderRadius: "8px" }}>
      <h3>Settings</h3>

      <div style={{ marginBottom: "15px" }}>
        <label>Background Color: </label>
        <input
          type="color"
          value={backgroundColor}
          onChange={(e) =>
            dispatch(
              setLocalSettings({
                backgroundColor: e.target.value,
                wireframe_mode,
                material_type,
                hdri_preset,
              })
            )
          }
        />
      </div>

      <div style={{ marginBottom: "15px" }}>
        <label>
          <input
            type="checkbox"
            checked={wireframe_mode}
            onChange={(e) =>
              dispatch(
                setLocalSettings({
                  backgroundColor,
                  wireframe_mode: e.target.checked,
                  material_type,
                  hdri_preset,
                })
              )
            }
          />
          Wireframe Mode
        </label>
      </div>

      <div style={{ marginBottom: "15px" }}>
        <label>
          Material Type:
          <select
            value={material_type}
            onChange={(e) =>
              dispatch(
                setLocalSettings({
                  backgroundColor,
                  wireframe_mode,
                  material_type: e.target.value,
                  hdri_preset,
                })
              )
            }
            style={{ marginLeft: "10px" }}
          >
            {MATERIAL_TYPES.map((mat) => (
              <option key={mat.value} value={mat.value}>
                {mat.label}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div style={{ marginBottom: "15px" }}>
        <label>
          HDRI Environment:
          <select
            value={hdri_preset}
            onChange={(e) =>
              dispatch(
                setLocalSettings({
                  backgroundColor,
                  wireframe_mode,
                  material_type,
                  hdri_preset: e.target.value,
                })
              )
            }
            style={{ marginLeft: "10px" }}
          >
            {HDRI_PRESETS.map((preset) => (
              <option key={preset} value={preset}>
                {preset.charAt(0).toUpperCase() + preset.slice(1)}
              </option>
            ))}
          </select>
        </label>
      </div>

      <button onClick={handleSave} style={{ padding: "8px 16px", cursor: "pointer" }}>
        Save Settings
      </button>
    </div>
  );
}