const express = require("express");
const { uploadModel } = require("../controllers/mediaController");
const router = express.Router();
const upload = require("../utils/multerhelper");

router.post("/upload", upload.single("model"), uploadModel);

module.exports = router;
