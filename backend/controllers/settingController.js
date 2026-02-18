const Setting = require("../models/settings");

exports.saveSettings = async (req, res) => {
  try {
    const { media_id, backgroundColor, wireframe_mode } = req.body;

    const setting = new Setting({
      media_id,
      backgroundColor,
      wireframe_mode,
    });

    const savedSetting = await setting.save();

    res.status(201).json({
      message: "Viewer settings saved",
      data: savedSetting,
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getSettings = async (req, res) => {
  try {
    const settings = await Setting.find({
      media_id: req.params.mediaId,
    }).populate("media_id");

    res.json(settings);

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};