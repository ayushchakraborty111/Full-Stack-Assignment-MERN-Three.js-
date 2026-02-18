const path = require("path");
const Media = require("../models/media");

exports.uploadModel = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    const fileExtension = path
      .extname(req.file.originalname)
      .replace(".", "")
      .toLowerCase();

    const fileUrl = `http://localhost:5000/uploads/${req.file.filename}`;

    const media = new Media({
      media_url: fileUrl,
      file_type: fileExtension,
      original_name: req.file.originalname,
    });

    const savedMedia = await media.save();

    res.status(201).json({
      message: "File uploaded successfully",
      data: savedMedia,
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};