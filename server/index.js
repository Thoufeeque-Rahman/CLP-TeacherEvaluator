const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const path = require("path");
const session = require("express-session");
const sessionConfig = require("./config/session");
const cookieParser = require('cookie-parser');
require("dotenv").config({ path: path.resolve(__dirname, "../.env") });

const app = express();

// Middleware
app.use(
  cors({
    origin: [
      process.env.VITE_FRONT_URL,
      'http://localhost:5173', // Vite dev server default port
      'http://127.0.0.1:5173'
    ],
    credentials: true,
  })
);
app.use(express.json());
app.use(cookieParser());

// Session middleware
app.use(session(sessionConfig));

// Session check middleware
app.use((req, res, next) => {
  if (req.session && req.session.userId) {
    res.locals.user = req.session.userId;
  }
  next();
});

// Define routes
app.get("/api/test", (req, res) => {
  res.send("API is running...");
});

// Import routes
const studentRoutes = require("./routes/students");
const teachersRoutes = require("./routes/teachers");
const roundsRoutes = require("./routes/rounds");
const dvtMarksRoutes = require("./routes/dvtMarks");

// Use routes
app.use("/api/students", studentRoutes);
app.use("/api/teachers", teachersRoutes);
app.use("/api/rounds", roundsRoutes);
app.use("/api/dvtMarks", dvtMarksRoutes);

app.use(express.static(path.join(__dirname, 'public')));

// Get MongoDB URL from config to ensure consistency
const MONGODB_URL = process.env.MONGODB_URL || 'mongodb+srv://rahmanam90:9946337540@cluster0.8sxy4wx.mongodb.net/my_dvt_db';

// Connect to MongoDB with updated options
mongoose
  .connect(MONGODB_URL, {
    serverSelectionTimeoutMS: 10000,
    socketTimeoutMS: 45000,
  })
  .then(() => console.log("MongoDB connected successfully"))
  .catch((err) => console.error("MongoDB connection error:", err));

// Then static files
app.use(express.static(path.join(__dirname, '../client/dist')));

const staticPath = path.join(__dirname, '../client/dist/index.html');
console.log('Serving static files from:', staticPath);

// THEN catch-all route
app.get(/^(?!\/?api).*/, (req, res) => {
  res.sendFile(path.join(__dirname, '../client/dist/index.html'));
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
