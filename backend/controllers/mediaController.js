const path = require("path");
const fs = require("fs");
const Media = require("../models/media");
const Setting = require("../models/settings");
const { AppError, catchAsyncErrors } = require("../middleware/errorHandler");

exports.uploadModel = catchAsyncErrors(async (req, res, next) => {
  if (!req.file) {
    return next(new AppError("No file uploaded", 400));
  }

  const fileExtension = path
    .extname(req.file.originalname)
    .replace(".", "")
    .toLowerCase();

  const allowedTypes = ["glb", "gltf"];
  if (!allowedTypes.includes(fileExtension)) {
    return next(new AppError(`Invalid file type. Allowed types: ${allowedTypes.join(", ")}`, 400));
  }

  const fileUrl = req.file.path;

  const media = new Media({
    media_url: fileUrl,
    file_type: fileExtension,
    original_name: req.file.originalname,
  });

  const savedMedia = await media.save();

  res.status(201).json({
    success: true,
    message: "File uploaded successfully",
    file_url: savedMedia.media_url,
    media_id: savedMedia._id,
    data: savedMedia,
  });
});

exports.deleteModel = catchAsyncErrors(async (req, res, next) => {
  const { mediaId } = req.params;

  if (!mediaId) {
    return next(new AppError("Media ID is required", 400));
  }

  const media = await Media.findById(mediaId);

  if (!media) {
    return next(new AppError("Media not found", 404));
  }

  const filename = media.media_url.split("/").pop();
  const filepath = path.join(__dirname, "../uploads", filename);

  if (fs.existsSync(filepath)) {
    try {
      fs.unlinkSync(filepath);
    } catch (err) {
      console.error("Error deleting file:", err);
    }
  }

  await Promise.all([
    Media.findByIdAndDelete(mediaId),
    Setting.deleteOne({ media_id: mediaId }),
  ]);

  res.status(200).json({
    success: true,
    message: "Media deleted successfully"
  });
});

exports.getLatestMedia = catchAsyncErrors(async (req, res, next) => {
  const media = await Media.findOne().sort({ createdAt: -1 });

  if (!media) {
    return next(new AppError("No media found", 404));
  }

  res.status(200).json({
    success: true,
    data: media,
  });
});