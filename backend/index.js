require('dotenv').config();
const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const connectDB = require('./config/db');
const mediaRoutes = require("./routes/mediaRoutes");
const settingRoutes = require("./routes/settingRoutes");
const { errorHandler } = require('./middleware/errorHandler');

const PORT = process.env.PORT || 5000;

const app = express();

connectDB();

app.use(cors());
app.use(express.json());

app.use("/media", mediaRoutes);
app.use("/settings", settingRoutes);

app.use((req, res) => {
  res.status(404).json({
    success: false,
    statusCode: 404,
    message: "Route not found"
  });
});

app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});``