const path = require("path");
const fs = require("fs");
const Media = require("../models/media");
const Setting = require("../models/settings");

exports.uploadModel = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    const fileExtension = path
      .extname(req.file.originalname)
      .replace(".", "")
      .toLowerCase();

    const fileUrl = `${process.env.BACKEND_URL}/uploads/${req.file.filename}`;

    const media = new Media({
      media_url: fileUrl,
      file_type: fileExtension,
      original_name: req.file.originalname,
    });

    const savedMedia = await media.save();

    res.status(201).json({
      message: "File uploaded successfully",
      file_url: savedMedia.media_url,
      media_id: savedMedia._id,
      data: savedMedia,
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.deleteModel = async (req, res) => {
  try {
    const media = await Media.findById(req.params.mediaId);

    if (!media) {
      return res.status(404).json({ message: "Media not found" });
    }

    const filename = media.media_url.split("/").pop();
    const filepath = path.join(__dirname, "../uploads", filename);

    if (fs.existsSync(filepath)) {
      fs.unlinkSync(filepath);
    }

    await Promise.all([
      Media.findByIdAndDelete(req.params.mediaId),
      Setting.deleteOne({ media_id: req.params.mediaId }),
    ]);

    res.json({ message: "Media deleted successfully" });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getLatestMedia = async (req, res) => {
  try {
    const media = await Media.findOne().sort({ createdAt: -1 });

    if (!media) {
      return res.status(404).json({ message: "No media found" });
    }

    res.json(media);

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};