require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const mediaRoutes = require("./routes/mediaRoutes");
const settingRoutes = require("./routes/settingRoutes");

const PORT = process.env.PORT || 5000;

const app = express();


connectDB();

app.use(cors());
app.use(express.json());

app.use("/uploads", express.static("uploads"));

app.use("/media", mediaRoutes);
app.use("/settings", settingRoutes);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});``