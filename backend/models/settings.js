const { default: mongoose } = require("mongoose");

const settingSchema = new mongoose.Schema(
  {
    media_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Media",
      required: true,
    },
    backgroundColor: {
      type: String,
      required: true,
    },
    wireframe_mode: {
      type: Boolean,
      default: false,
    },
    material_type: {
      type: String,
      default: "standard",
    },
    hdri_preset: {
      type: String,
      default: "sunset",
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Setting", settingSchema);
