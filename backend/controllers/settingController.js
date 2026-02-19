const Setting = require("../models/settings");

exports.saveSettings = async (req, res) => {
  try {
    const { media_id, backgroundColor, wireframe_mode, material_type, hdri_preset } = req.body;

    const setting = await Setting.findOneAndUpdate(
      { media_id },
      { backgroundColor, wireframe_mode, material_type, hdri_preset },
      { new: true, upsert: true }
    );

    res.status(201).json({
      message: "Viewer settings saved",
      data: setting,
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getSettings = async (req, res) => {
  try {
    const settings = await Setting.find({
      media_id: req.params.mediaId,
    }).sort({ updatedAt: -1 }).populate("media_id");

    res.json(settings);

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};