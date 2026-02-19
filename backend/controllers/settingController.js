const Setting = require("../models/settings");
const { catchAsyncErrors, AppError } = require("../middleware/errorHandler");

exports.saveSettings = catchAsyncErrors(async (req, res, next) => {
  const { media_id, backgroundColor, wireframe_mode, material_type, hdri_preset } = req.body;

  if (!media_id) {
    return next(new AppError("Media ID is required", 400));
  }

  if (!backgroundColor) {
    return next(new AppError("Background color is required", 400));
  }

  const setting = await Setting.findOneAndUpdate(
    { media_id },
    { backgroundColor, wireframe_mode, material_type, hdri_preset },
    { new: true, upsert: true, runValidators: true }
  );

  res.status(201).json({
    success: true,
    message: "Viewer settings saved successfully",
    data: setting,
  });
});

exports.getSettings = catchAsyncErrors(async (req, res, next) => {
  const { mediaId } = req.params;

  if (!mediaId) {
    return next(new AppError("Media ID is required", 400));
  }

  const settings = await Setting.find({
    media_id: mediaId,
  })
    .sort({ updatedAt: -1 })
    .populate("media_id");

  if (settings.length === 0) {
    return next(new AppError("No settings found for this media", 404));
  }

  res.status(200).json({
    success: true,
    count: settings.length,
    data: settings,
  });
});