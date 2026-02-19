const express = require("express");
const { saveSettings, getSettings } = require("../controllers/settingController");

const router = express.Router();

router.post("/", saveSettings);
router.get("/:mediaId", getSettings);

module.exports = router;
