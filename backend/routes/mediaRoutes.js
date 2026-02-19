const express = require("express");
const { uploadModel, deleteModel, getLatestMedia } = require("../controllers/mediaController");
const router = express.Router();
const upload = require("../utils/multerhelper");

router.post("/upload", upload.single("model"), uploadModel);
router.delete("/:mediaId", deleteModel);
router.get("/latest", getLatestMedia);

module.exports = router;
