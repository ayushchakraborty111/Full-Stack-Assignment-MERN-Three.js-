const { default: mongoose } = require("mongoose");

const mediaSchema = new mongoose.Schema(
  {
    media_url: {
      type: String,
      required: true,
    },
    file_type: {
      type: String,
      enum: ["glb", "gltf"],
      required: true,
    },
    original_name: {
      type: String,
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Media", mediaSchema);
