const multer = require("multer");
const path = require("path");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const cloudinary = require("../config/cloudinary");

const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "3d-models",
    resource_type: "raw",
    public_id: (req, file) => {
      return Date.now() + path.parse(file.originalname).name;
    },
  },
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = [".glb", ".gltf"];
  const ext = path.extname(file.originalname).toLowerCase();

  if (allowedTypes.includes(ext)) {
    cb(null, true);
  } else {
    cb(new Error("Only .glb and .gltf files are allowed"));
  }
};

const upload = multer({ storage, fileFilter });
module.exports = upload;